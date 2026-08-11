#!/usr/bin/env node

import { startServer } from "./server.js";
import { clear as clearCache } from "./cache/cache-store.js";

interface CliOptions {
  port?: number;
  origin?: string;
  clearCache: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { clearCache: false };

  for (let i = 0; i < argv.length, i++) {
    const arg = argv[i]

    switch(arg){
        case '--port':
            options.port = Number(argv[++i])
            break
        
        case '--origin':
            options.origin = argv[++i]
            break
        
        case '--clear-cache':
            options.clearCache = true
            break

        default:
            console.error(`Unknown argument: ${arg}`)
            process.exit(1)
    }
  }
}
