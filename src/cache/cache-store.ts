import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

export async function connect(): Promise<void> {
  if (!client.isOpen) {
    await client.connect();
  }
}

export { client };
