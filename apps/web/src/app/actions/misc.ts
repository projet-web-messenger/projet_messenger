import "server-only";

import { Applications, init } from "@kinde/management-api-js";

export async function getConnections() {
  init();
  const { connections } = await Applications.getApplicationConnections({
    applicationId: process.env.KINDE_CLIENT_ID || "",
  });

  if (!connections || connections.length === 0) {
    return undefined;
  }

  return connections as Array<Required<(typeof connections)[0]["connection"]>>;
}
