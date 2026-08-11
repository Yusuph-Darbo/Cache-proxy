#!/usr/bin/env node

import { startServer } from "./server.js";
import { clear as clearCache } from "./cache/cache-store.js";

interface CliOptions {
  port?: number;
  origin?: string | undefined;
  clearCache: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { clearCache: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case "--port":
        options.port = Number(argv[++i]);
        break;

      case "--origin":
        options.origin = argv[++i];
        break;

      case "--clear-cache":
        options.clearCache = true;
        break;

      default:
        console.error(`Unknown argument: ${arg}`);
        process.exit(1);
    }
  }

  return options;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.clearCache) {
    await clearCache();
    console.log("Cache cleared");
    process.exit(0);
  }

  if (!options.port || !options.origin) {
    console.error("Usage: caching-proxy --port <number> -- origin <url>");
    console.error("       caching-proxy --clear-cache");
    process.exit(1);
  }

  await startServer(options.port, options.origin);
}

main();
