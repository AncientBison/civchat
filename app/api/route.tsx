import { randomUUID } from "crypto";
import { IncomingMessage } from "http";

import { WebSocketServer } from "ws";
import { getClient } from "@lib/redis";
import { logger } from "@lib/pino";
import {
  WebSocketWithUuid,
  getClientFromUuid,
  sendSocketMessage,
} from "@lib/socket";
import { Partners } from "@lib/partners";
import { addToQueue } from "@lib/socketEndpoints/addToQueue";
import { pong } from "@lib/socketEndpoints/pong";
import { SocketEndpointData } from "@type/socketEndpoint";
import { opinion } from "@lib/socketEndpoints/opinion";
import { textMessage } from "@lib/socketEndpoints/textMessage";
import { endChat } from "@lib/socketEndpoints/endChat";
import { startTyping } from "@lib/socketEndpoints/startTyping";

export function SOCKET(
  client: WebSocketWithUuid,
  request: IncomingMessage,
  server: WebSocketServer,
) {
  let id: string = "";
  let partners: Partners | undefined;

  let timeOfLastPong: Date = new Date(-1);

  let ensureConnectionInterval: NodeJS.Timeout | undefined;

  async function setId(idToSet?: string) {
    if (idToSet === undefined) {
      id = randomUUID();
      sendSocketMessage(client, {
        type: "setIdResult",
        data: {
          message: "generatedId",
          id,
        },
      });
    } else if (getClientFromUuid(idToSet, server) !== undefined) {
      sendSocketMessage(client, {
        type: "setIdResult",
        data: {
          message: "idTaken",
          id,
        },
      });
    } else {
      id = idToSet;
      sendSocketMessage(client, {
        type: "setIdResult",
        data: {
          message: "setId",
          id,
        },
      });
    }

    client.uuid = id;
    logger.info("Socket id assigned: " + id);

    timeOfLastPong = new Date();

    ensureConnectionInterval = setInterval(async () => {
      if (Date.now() - timeOfLastPong.getTime() > 10 * 1000) {
        logger.warn("Client disconnected unexpectedly: " + id);
        client.terminate();
        await closeSocket();
        client.removeAllListeners();
      }
    }, 1000);
  }

  client.on("message", async (message) => {
    logger.debug(`Recived message ${message.toString()} for ${id}`);

    logger.debug("Parsing payload");
    const payload = JSON.parse(message.toString());

    if (payload.type === "setId") {
      logger.debug(
        `Skipping normal execution due to payload type setId: ${id}`,
      );
      if (id === "") {
        logger.debug("Setting id of new client");
        await setId(payload.data.id);

        return;
      } else {
        logger.debug(`Id already set on setId request: ${id}`);
        sendSocketMessage(client, {
          type: "setIdResult",
          data: {
            message: "idAlreadySet",
            id,
          },
        });

        return;
      }
    }

    if (id === "") {
      logger.debug("Client request without id");

      sendSocketMessage(client, {
        type: "noId",
      });

      return;
    }

    if (payload.type === "ping") {
      timeOfLastPong = await pong(client);

      return;
    }

    if (partners === undefined) {
      logger.debug("Starting getting redis connection");
      partners = new Partners(await getClient());
      logger.debug("Redis connection established");
    }

    const data: SocketEndpointData = {
      client,
      id,
      partners,
      server,
    };

    switch (payload.type) {
      case "addToQueue":
        await addToQueue(data);
        break;
      case "opinion":
        await opinion(data, { opinion: payload.data.opinion });
        break;
      case "textMessage":
        await textMessage(data, { text: payload.data.text });
        break;
      case "endChat":
        await endChat(data);
        break;
      case "startTyping":
        await startTyping(data, { typing: payload.data.typing });
        break;
      default:
        if (process.env.NODE_ENV === "development") {
          logger.warn("Unknown message type:", payload.type);
        }
    }
  });

  async function closeSocket() {
    if (id !== "") {
      logger.info("Socket closed: " + id);
    }
    const redis = await getClient();

    if (partners !== undefined && (await partners.has(id))) {
      const partnerId = (await partners.getPartnerId(id))!;
      const partner = getClientFromUuid(partnerId, server);

      if (partner !== undefined) {
        sendSocketMessage(partner, { type: "partnerLeft" });
      }
      await partners.seperatePartners(id, partnerId);
    }
    await redis.lRem("queue", 1, id);

    if (ensureConnectionInterval !== undefined) {
      clearInterval(ensureConnectionInterval);
    }
  }

  client.on("close", closeSocket);

  client.on("open", () => {
    id = "";
    partners = undefined;

    timeOfLastPong = new Date(-1);

    ensureConnectionInterval = undefined;
  });

  client.on("error", (error) => {
    logger.error(`Client error: ${error.name} with message ${error.message}`);
  });
}
