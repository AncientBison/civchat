import { createClient } from "redis";

export async function getClient() {
  const client = await createClient({
    url: process.env.REDIS_URL,
  })
    .on("error", (err) => () => {
      console.error("Redis Client Error", err);
    })
    .connect();

  return client;
}
