import { Message } from "@type/message";
import WsWebSocket, { WebSocketServer } from "ws";

export interface WebSocketWithUuid extends WsWebSocket {
  uuid: string;
}

export function sendSocketMessage(
  socket: WsWebSocket | WebSocket,
  message: Message,
) {
  if (
    socket.readyState === WebSocket.CLOSED ||
    socket.readyState === WebSocket.CLOSING
  ) {
    throw Error("Socker closed or closing");
  } else if (socket.readyState === socket.CONNECTING) {
    socket.onopen = () => {
      socket.send(JSON.stringify(message));
    };
  } else {
    socket.send(JSON.stringify(message));
  }
}

export function getClientFromUuid(uuid: string, server: WebSocketServer) {
  return Array.from(server.clients).find(
    (client) => (client as WebSocketWithUuid).uuid === uuid,
  );
}
