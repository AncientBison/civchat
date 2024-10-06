import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { isPayloadOfType } from "@lib/isPayloadOfType";
import { MessageType, TypedMessage } from "@type/message";
import { sendSocketMessage } from "@lib/socket";

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
    clearInterval(pingInterval);
    timeOfLastSocketCreation = new Date();
    Object.assign(socket, new WebSocket(socket.url));
    socket.onopen = () => {
      console.error("it opened");
      sendSocketMessage(socket, {
        type: "setId",
        data: { id: localStorage.getItem("id") ?? undefined },
      });
      createPingInterval();
    };
  };

  let pingInterval: ReturnType<typeof setTimeout>;

  function createPingInterval() {
    const pingInterval = setInterval(() => {
      if (
        socket!.readyState === WebSocket.CLOSED ||
        socket!.readyState === WebSocket.CLOSING
      ) {
        if (Date.now() - timeOfLastSocketCreation.getTime() > 20 * 1000) {
          createNewSocketConnection();
        }
      } else {
        sendSocketMessage(socket!, { type: "ping" });
      }
    }, 1000);
  }

  createPingInterval();

  return () => {
    socket.removeEventListener("message", onMessage);
    clearInterval(pingInterval);
  };
}
