import { TypedSocket } from "@type/socket";
import { getRedisClient } from "@lib/redis";
import { SocketEndpointData } from "@type/socketEndpoint";

export async function closeSocket({
  client,
  partners,
  server,
}: SocketEndpointData) {
  const redis = await getRedisClient();

  if (partners !== undefined && (await partners.has(client.id))) {
    const partnerId = (await partners.getPartnerId(client.id))!;
    server.to(partnerId).emit("partnerLeft", {}, () => {});
    await partners.seperatePartners(client.id, partnerId);
  }

  await redis.lRem("queue", 1, client.id);
}
