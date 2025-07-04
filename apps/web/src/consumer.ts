import * as amqp from "amqplib";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function consumeFromQueue(queueName: string, callback: (data: any) => void) {
  try {
    const conn = await amqp.connect("amqp://localhost:5672");
    const channel = await conn.createChannel();

    await channel.assertQueue(queueName, { durable: false });

    channel.consume(queueName, (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        console.log("Data received from queue:", data);
        callback(data);
        channel.ack(msg);
      }
    });

    console.log(`📡 Subscribed to queue: ${queueName}`);
  } catch (error) {
    console.error("❌ Error consuming from queue:", error);
  }
}
