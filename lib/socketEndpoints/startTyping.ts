import { getClientFromUuid, sendSocketMessage } from "@lib/socket";
import { SocketEndpointData } from "@type/socketEndpoint";

export async function startTyping(
  { client, id, partners, server }: SocketEndpointData,
  {
    typing,
  }: {
    typing: boolean;
  },
) {
  const partnerId = await partners!.getPartnerId(id);

  if (partnerId === undefined) {
    return;
  }

  const partner = getClientFromUuid(partnerId, server);

  if (!partner) {
    return;
  }

  sendSocketMessage(partner, {
    type: "startTyping",
    data: { typing },
  });
}
