import "server-only";

import { Applications, type GetConnectionResponse, init } from "@kinde/management-api-js";

export type Connection = NonNullable<Required<GetConnectionResponse["connection"]>>;

export async function getConnections() {
  init();
  const { connections } = await Applications.getApplicationConnections({
    applicationId: process.env.KINDE_CLIENT_ID || "",
  });

  if (!connections || connections.length === 0) {
    return undefined;
  }

  return connections as Array<Connection>;
}
