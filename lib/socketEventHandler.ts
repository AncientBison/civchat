import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { isPayloadOfType } from "./isPayloadOfType";

import { Message, MessageType, TypedMessage } from "@/app/api/route";

type Handler<T extends MessageType> = {
  type: T;
  handler: (message: TypedMessage<T>) => void;
};

type Handlers<T extends MessageType[]> = { [K in keyof T]: Handler<T[K]> };

export function createSocketEventHandler<T extends MessageType[]>(
  socket: WebSocket | null,
  router: AppRouterInstance,
  ...handlers: Handlers<T>
) {
  if (socket === null) {
    return;
  }

  async function onMessage(event: MessageEvent) {
    const payload =
      typeof event.data === "string" ? event.data : await event.data.text();

    const message = JSON.parse(payload);

    if (process.env.NODE_ENV === "development") {
      console.log("Message recived", message);
    }

    if (isPayloadOfType(message, "partnerLeft")) {
      router.push("/?left");
    }

    for (const handler of handlers) {
      if (isPayloadOfType(message, handler.type)) {
        handler.handler(message);
      }
    }
  }

  socket.removeEventListener("message", onMessage);
  socket.addEventListener("message", onMessage);

  let timeOfLastSocketCreation = new Date();

  const createNewSocketConnection = () => {
    timeOfLastSocketCreation = new Date();
    Object.assign(socket, new WebSocket(socket.url));
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "setId",
          data: { id: localStorage.getItem("id") ?? undefined },
        } satisfies Message),
      );
    };
  };

  const keepOpenSocketInterval = setInterval(() => {
    if (
      (socket.readyState === WebSocket.CLOSED ||
        socket.readyState === WebSocket.CLOSING) &&
      Date.now() - timeOfLastSocketCreation.getTime() > 20 * 1000
    ) {
      createNewSocketConnection();
    }
  }, 500);

  const pingInterval = setInterval(() => {
    socket.send(JSON.stringify({ type: "ping" } satisfies Message));
  }, 1000);

  return () => {
    socket.removeEventListener("message", onMessage);
    clearInterval(pingInterval);
    clearInterval(keepOpenSocketInterval);
  };
}
