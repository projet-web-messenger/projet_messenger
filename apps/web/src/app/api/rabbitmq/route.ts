import * as amqp from "amqplib";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const responseStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const startConsuming = async () => {
        try {
          const conn = await amqp.connect("amqp://localhost:5672");
          const channel = await conn.createChannel();

          await channel.assertQueue("messages", { durable: false });

          channel.consume("messages", (msg) => {
            if (msg) {
              const data = JSON.parse(msg.content.toString());
              console.log("Message received from queue:", data);

              // Send data via Server-Sent Events
              const sseData = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(sseData));

              channel.ack(msg);
            }
          });

          console.log("📡 RabbitMQ consumer started");
        } catch (error) {
          console.error("❌ Error consuming from RabbitMQ:", error);
          controller.error(error);
        }
      };

      startConsuming();

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        controller.close();
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
