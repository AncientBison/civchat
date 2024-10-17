import { Events } from "@lib/socketEndpoints/events";
import { Handler } from "@lib/socketEndpoints";

export const requestCurrentlyOnlineCount: Handler<
  Events["RequestCurrentlyOnlineCount"]
> = async ({ client, partners, server }, {}, callback) => {
  callback({
    message: "currentlyOnline",
    count: server.engine.clientsCount,
  });
};
