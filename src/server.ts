import express from "express";
import type { Express, Request, Response } from "express";
import { forwardToOrigin } from "./proxy.js";
import * as cacheStore from "./cache/cache-store.js";

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(3000);
