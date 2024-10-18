import { createServer } from "node:http";

import next from "next";
import { Server, Socket } from "socket.io";
import { logger } from "@lib/pino";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@lib/socketEndpoints";
import { Partners } from "@lib/partners";
import { getRedisClient } from "@lib/redis";
import {
  InterServerEvents,
  SocketData,
  TypedServer,
  TypedSocket,
} from "@type/socket";
import { addToQueue } from "@lib/socketEndpoints/addToQueue";
import { opinion } from "@lib/socketEndpoints/opinion";
import { endChat } from "@lib/socketEndpoints/endChat";
import { textMessage } from "@lib/socketEndpoints/textMessage";
import { typingState } from "@lib/socketEndpoints/typingState";
import { requestCurrentlyOnlineCount } from "@lib/socketEndpoints/requestCurrentlyOnlineCount";
import { closeSocket } from "@lib/closeSocket";

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
    logger.info("New connection");
    socket.on("addToQueue", async (params, callback) =>
      addToQueue(await getData(socket, io), params, callback),
    );
    socket.on("endChat", async (params, callback) =>
      endChat(await getData(socket, io), params, callback),
    );
    socket.on("opinion", async (params, callback) =>
      opinion(await getData(socket, io), params, callback),
    );
    socket.on("textMessage", async (params, callback) =>
      textMessage(await getData(socket, io), params, callback),
    );
    socket.on("typingState", async (params, callback) =>
      typingState(await getData(socket, io), params, callback),
    );
    socket.on("requestCurrentlyOnlineCount", async (params, callback) =>
      requestCurrentlyOnlineCount(await getData(socket, io), params, callback),
    );

    // if (socket.recovered) {
    //   // TODO: write recovery condition
    // } else {

    // }
    updateCurrentlyOnlineCount(socket, io);
    
    socket.on("disconnect", async () => {
      closeSocket(await getData(socket, io));
      updateCurrentlyOnlineCount(socket, io);
    });
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

function updateCurrentlyOnlineCount(socket: TypedSocket, io: TypedServer) {
  socket.broadcast.emit(
    "currentOnline",
    {
      count: io.engine.clientsCount,
    },
    () => {},
  );

  socket.emit(
    "currentOnline",
    {
      count: io.engine.clientsCount,
    },
    () => {},
  );
}
