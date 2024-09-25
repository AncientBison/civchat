import { createClient } from "redis";
import { logger } from "@lib/pino";

declare global {
  var redisClient: ReturnType<typeof createClient>;
}

export async function getClient() {
  if (
    globalThis.redisClient !== undefined &&
    globalThis.redisClient.isOpen === true
  ) {
    logger.debug("Using cached redis client");

    return globalThis.redisClient;
  } else {
    logger.debug(
      `Creating new redis client becuase ${globalThis.redisClient === undefined ? "Redis client is undefined" : "Redis client is not open"}`,
    );

    globalThis.redisClient = await createClient({
      url: process.env.REDIS_URL,
    })
      .on("error", (err) => () => {
        logger.error("Redis Client Error", err);
      })
      .connect();

    return globalThis.redisClient;
  }
}
