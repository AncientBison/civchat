import { getClientFromUuid, sendSocketMessage } from "@lib/socket";
import { SocketEndpointData } from "@type/socketEndpoint";
import { Handler } from '@lib/socketEndpoints';
import { Events } from "@lib/socketEndpoints/events";

export const endChat: Handler<Events["EndChat"]> = async ({
  client,
  partners,
  server
}) => {
  const partnerId = await partners.getPartnerId(client.id);

  if (partnerId === undefined) {
    return;
  }

  server.to(partnerId).emit("endChat", {});

  await partners.seperatePartners(client.id, partnerId);
}
