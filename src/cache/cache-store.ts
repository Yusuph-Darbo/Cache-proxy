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

function deserialise(raw: string): OriginResponse {
  const parsed = JSON.parse(raw);
  return {
    status: parsed.status,
    headers: parsed.headers,
    body: Buffer.from(parsed.body, "base64"),
  };
}

export async function get(key: string): Promise<OriginResponse | null> {
  const raw = await client.get(key);
  return raw ? deserialise(raw) : null;
}

export async function set(
  key: string,
  value: OriginResponse,
  ttl: number | null = null,
): Promise<void> {
  const serialised = serialise(value);

  if (ttl) {
    await client.set(key, serialised, { EX: ttl });
  } else {
    await client.set(key, serialised);
  }
}

export async function clear(): Promise<void> {
  await client.flushDb();
}
export { client };
