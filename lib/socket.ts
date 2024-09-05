import { Message } from "@/app/api/route";

export function sendSocketMessage(socket: WebSocket, message: Message) {
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
