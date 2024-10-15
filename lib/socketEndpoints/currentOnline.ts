import { sendSocketMessage } from "@lib/socket";
import { SocketEndpointData } from "@type/socketEndpoint";
import { Events, Handler } from '@lib/socketEndpoints';

export const currentOnline: Handler<Events.CurrentOnline> = async ({
  client,
  server,
  partners,
}) => {
  return {
    message: "currentOnline",
    count: server.engine.clientsCount
  }
}
