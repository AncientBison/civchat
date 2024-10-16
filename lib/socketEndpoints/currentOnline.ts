import { Handler } from "@lib/socketEndpoints";
import { Events } from "@lib/socketEndpoints/events";

export const currentOnline: Handler<Events["CurrentOnline"]> = async ({
  client,
  server,
  partners,
}) => {
  return {
    message: "currentOnline",
    count: server.engine.clientsCount,
  };
};
