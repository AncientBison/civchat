import { createServer } from "node:http";

import next from "next";
import { Server } from "socket.io";
import { logger } from "@lib/pino";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@lib/socketEndpoints";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

interface InterServerEvents {}

interface SocketData {
  name: string;
  age: number;
}

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer);

  io.on("connection", (socket) => {
    if (socket.recovered) {
      // TODO: write recovery condition
    } else {
      // TODO: rewrite handlers to work better for
    }
  });

  httpServer
    .once("error", (err) => {
      logger.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      logger.debug(`> Ready on http://${hostname}:${port}`);
    });
});
