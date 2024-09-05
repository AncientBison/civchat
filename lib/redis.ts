import { createClient } from "redis";

export async function getClient() {
  const client = await createClient()
    .on("error", (err) => () => {
      if (process.env.NODE_ENV === "development") {
        console.error("Redis Client Error", err);
      }
    })
    .connect();

  return client;
}
