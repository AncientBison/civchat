import { createClient } from "redis";

import { logger } from "./pino";

declare global {
  var redisClient: ReturnType<typeof createClient>;
}

export async function getClient() {
  if (globalThis.redisClient !== undefined && globalThis.redisClient.isOpen === true) {
    return globalThis.redisClient;
  } else {
    return await createClient({
      url: process.env.REDIS_URL,
    })
      .on("error", (err) => () => {
        if (process.env.NODE_ENV === "development") {
          logger.error("Redis Client Error", err);
        }
      })
      .connect();
  } 
}
