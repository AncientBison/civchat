import { sendSocketMessage } from "@lib/socket";
import { SocketEndpointData } from "@type/socketEndpoint";

export async function currentOnline({
  client,
  id,
  partners,
  server,
}: SocketEndpointData) {
  sendSocketMessage(client, {
    type: "currentOnlineResponse",
    data: {
      count: parseInt((await partners.getRedisClient().get("usersOnline"))!),
    },
  });
}
