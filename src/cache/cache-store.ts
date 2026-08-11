import { createClient } from "redis";
import type { OriginResponse } from "../proxy.js";

const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

export async function connect(): Promise<void> {
  if (!client.isOpen) {
    await client.connect();
  }
}

// Redis stores strings only, so the response object gets JSON-encoded.
// Buffer can't survive JSON.stringify as-is, so it's converted to base64
// on the way in and back to a Buffer on the way out.
function serialise(response: OriginResponse): string {
  return JSON.stringify({
    status: response.status,
    headers: response.headers,
    body: response.body.toString("base64"),
  });
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
