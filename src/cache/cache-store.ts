import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

export async function connect(): Promise<void> {
  if (!client.isOpen) {
    await client.connect();
  }
}

export async function get(key: string): Promise<string | null> {
  const value = await client.get(key);
  return value;
}

export async function set(
  key: string,
  value: string,
  ttl: number | null,
): Promise<void> {
  if (ttl) {
    await client.set(key, ttl, { EX: ttl });
  } else {
    await client.set(key, value);
  }
}

export async function clear(): Promise<void> {
  await client.flushDb();
}
export { client };
