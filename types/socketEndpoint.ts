import { Partners } from "@lib/partners";
import WebSocket, { WebSocketServer } from "ws";

export type SocketEndpointData = {
  client: WebSocket;
  server: WebSocketServer;
  id: string;
  partners: Partners;
};
