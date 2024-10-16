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
      // TODO: rewrite handlers to work better for
      socket.on("addToQueue", async () =>
        currentOnline(await getData(socket, io), []),
      );
      socket.on("currentOnline", async () =>
        currentOnline(await getData(socket, io), []),
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
