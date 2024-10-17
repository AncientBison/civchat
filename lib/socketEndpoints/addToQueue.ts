import { getClientFromUuid, sendSocketMessage } from "@lib/socket";
import { SocketEndpointData } from "@type/socketEndpoint";
import { Events } from '@lib/socketEndpoints/events';
import { Handler } from '@lib/socketEndpoints';
import { createRoomId } from "@lib/createRoomId";

export const addToQueue: Handler<Events["AddToQueue"]> = async ({
  client,
  partners,
  server,
}) => {
  const redis = partners.getRedisClient();
  const partnerId = await redis.rPop("queue");

  if (partnerId === null) {
    await redis.lRem("queue", 1, client.id);
    await redis.lPush("queue", client.id);
    return {
      message: "waiting"
    }
  } else {
    client.join(createRoomId(client.id, partnerId));

    const question = await partners.assignRandomQuestion(client.id, partnerId);

    server.to(partnerId).emit("addToRoom", {
      questionId: question.id
    });

    await partners.setPartners(client.id, partnerId);

    return {
      message: "addToRoom",
      questionId: question.id
    }
  }
}
