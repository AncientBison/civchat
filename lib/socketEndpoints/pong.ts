import { sendSocketMessage } from "@lib/socket";
import WebSocket from "ws";

export async function pong(client: WebSocket): Promise<Date> {
  sendSocketMessage(client, {
    type: "pong",
  });

  return new Date();
}
