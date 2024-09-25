import { getClientFromUuid, sendSocketMessage } from "@lib/socket";
import { SocketEndpointData } from "@type/socketEndpoint";

export async function addToQueue({
  client,
  id,
  partners,
  server,
}: SocketEndpointData) {
  const redis = partners.getRedisClient();
  const partnerId = await redis.rPop("queue");

  if (partnerId === null) {
    await redis.lRem("queue", 1, id);
    await redis.lPush("queue", id);
    sendSocketMessage(client, { type: "waiting" });
  } else {
    const partner = getClientFromUuid(partnerId, server);

    if (partner === undefined) {
      throw Error("Invalid databsae state");
    }

    await partners.setPartners(id, partnerId);

    const question = await partners.assignRandomQuestion(id, partnerId);

    sendSocketMessage(partner, {
      type: "addToRoom",
      data: {
        id,
        questionId: question.id,
      },
    });

    sendSocketMessage(client, {
      type: "addToRoom",
      data: {
        id: partnerId,
        questionId: question.id,
      },
    });
  }
}
