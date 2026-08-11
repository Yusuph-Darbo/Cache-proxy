# Cache-proxy

A CLI tool that starts a caching proxy server. It forwards requests to a real
origin server and caches the responses in Redis. Repeated requests to the
same endpoint are served from the cache instead of hitting the origin again.

## Requirements

- Node.js 18+
- A running Redis instance (local or remote)

## Installation

```bash
npm install
```

## Usage

Start the proxy, pointing it at a port to run on and an origin server to
forward requests to:

```bash
npm run dev -- --port 3000 --origin http://dummyjson.com
```

Any request made to the proxy is forwarded to the origin, cached, and
returned:

```bash
curl -i http://localhost:3000/products
```

Every response includes an `X-Cache` header:

```
X-Cache: MISS   # response was forwarded to the origin server
X-Cache: HIT    # response was served from the cache
```

Making the same request again returns the cached response without
contacting the origin server.

Clear the cache at any time:

```bash
npm run dev -- --clear-cache
```

## How it works

1. `cli.ts` parses `--port` / `--origin` / `--clear-cache` and dispatches to
   either the clear-cache path or the server startup path.
2. `server.ts` receives each incoming request, builds a cache key from the
   HTTP method and path, and checks the cache.
3. On a cache **miss**, `proxy.ts` forwards the request to the origin server
   and returns its status, headers, and body.
4. `cache/cache-store.ts` stores the response in Redis (serialized to JSON,
   with the body base64-encoded) and retrieves it on future requests.

```
cli.ts ──▶ server.ts ──▶ proxy.ts        (forwards to origin on a miss)
                    └──▶ cache-store.ts  (reads/writes Redis)
```

## Scripts

| Command         | Description                                |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Run the CLI with `tsx watch` (development) |
| `npm run build` | Compile TypeScript to `dist/`              |
| `npm start`     | Run the compiled CLI from `dist/`          |

## Notes

- The cache is keyed by `METHOD:path`, so `GET /products` and
  `DELETE /products` are cached separately.
- Cache eviction is handled by Redis itself rather than a custom LRU
  implementation — see your Redis config (`maxmemory-policy`) to control
  eviction behavior.
