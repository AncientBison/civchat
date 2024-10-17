import { createServer } from "node:http";

import next from "next";
import { Server, Socket } from "socket.io";
import { logger } from "@lib/pino";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@lib/socketEndpoints";
import { currentOnline } from "@lib/socketEndpoints/currentOnline";
import { Partners } from "@lib/partners";
import { getRedisClient } from "@lib/redis";
import { InterServerEvents, SocketData } from "@type/socket";
import { addToQueue } from '@lib/socketEndpoints/addToQueue';
import { opinion } from "@lib/socketEndpoints/opinion";
import { endChat } from "@lib/socketEndpoints/endChat";
import { textMessage } from '@lib/socketEndpoints/textMessage';
import { typingState } from "@lib/socketEndpoints/typingState";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer);

  io.on("connection", async (socket) => {
    if (socket.recovered) {
      // TODO: write recovery condition
    } else {
      socket.on("addToQueue", async () =>
        addToQueue(await getData(socket, io), {}),
      );
      socket.on("currentOnline", async () =>
        currentOnline(await getData(socket, io), {}),
      );
      socket.on("endChat", async () =>
        endChat(await getData(socket, io), {}),
      );
      socket.on("opinion", async ({opinion: selfOpinion}) =>
        opinion(await getData(socket, io), {
          opinion: selfOpinion
        }),
      );
      socket.on("textMessage", async ({text}) =>
        textMessage(await getData(socket, io), {
          text
        }),
      );
      socket.on("typingState", async ({typing}) =>
        typingState(await getData(socket, io), {
          typing
        }),
      );
    }
  });

  const getData = async (socket: Socket, io: Server) => {
    return {
      client: socket,
      server: io,
      partners: new Partners(await getRedisClient()),
    };
  };

  httpServer
    .once("error", (err) => {
      logger.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      logger.debug(`> Ready on http://${hostname}:${port}`);
    });
});
