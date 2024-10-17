import { getClientFromUuid, sendSocketMessage } from "@lib/socket";
import { SocketEndpointData } from "@type/socketEndpoint";
import { Handler } from "@lib/socketEndpoints";
import { Events } from "@lib/socketEndpoints/events";

export const typingState: Handler<Events["TypingState"]> = async ({
  client,
  partners,
  server
}, {
  typing
}) => {
  const partnerId = await partners!.getPartnerId(client.id);

  if (partnerId === undefined) {
    return;
  }

  server.to(partnerId).emit("typingState", {
    typing
  });
};
