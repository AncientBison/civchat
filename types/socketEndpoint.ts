import { Partners } from "@lib/partners";
import WebSocket, { WebSocketServer } from "ws";
import { TypedServer, TypedSocket } from "@type/socket";

export type SocketEndpointData = {
  client: TypedSocket;
  server: TypedServer;
  partners: Partners;
};
