import { Handler } from '@lib/socketEndpoints';
import { Events } from "@lib/socketEndpoints/events";

export const textMessage: Handler<Events["TextMessage"]> = async ({
  client,
  partners,
  server
}, {
  text
}) => {
  const partnerId = await partners.getPartnerId(client.id);

  if (partnerId === undefined) {
    return;
  }

  server.to(partnerId).emit("textMessage", {
    text
  });
}
