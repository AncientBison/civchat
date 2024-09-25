import { getClientFromUuid, sendSocketMessage } from "@lib/socket";
import { SocketEndpointData } from "@type/socketEndpoint";

export async function endChat({
  client,
  id,
  partners,
  server,
}: SocketEndpointData) {
  const partnerId = await partners!.getPartnerId(id);

  if (partnerId === undefined) {
    return;
  }

  const partner = getClientFromUuid(partnerId, server);

  if (!partner) {
    return;
  }

  sendSocketMessage(partner, {
    type: "endChat",
  });

  await partners.seperatePartners(id, partnerId);
}
