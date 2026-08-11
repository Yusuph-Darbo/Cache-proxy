import express from "express";
import type { Express, Request, Response } from "express";
import { forwardToOrigin } from "./proxy.js";
import * as cacheStore from "./cache/cache-store.js";

function buildCacheKey(req: Request): string {
  // Method matters
  // GET /products != DELETE /products
  return `${req.method}:${req.originalUrl}`;
}

export async function startServer(port: number, origin: string): Promise<void> {
  await cacheStore.connect();

  const app: Express = express();
  app.use(express.json());

  app.use(async (req: Request, res: Response) => {
    const key = buildCacheKey(req);

    try {
      const cached = await cacheStore.get(key);

      if (cached) {
        res.set(cached.headers);
        res.set("X-Cache", "HIT");
        res.status(cached.status).send(cached.body);
        return;
      }

      const response = await forwardToOrigin(req, origin);
      await cacheStore.set(key, response);

      res.set(response.headers);
      res.set("X-Cache", "MISS");
      res.status(response.status).send(response.body);
    } catch (err) {
      console.error(`Failed to handle ${req.method} ${req.originalUrl}:`, err);
      res.status(502).json({ error: "Bad gateway" });
    }
  });

  app.listen(port, () => {
    console.log(
      `Caching proxy running on port ${port}, forwarding to ${origin}`,
    );
  });
}
