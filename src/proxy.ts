import type { Request } from "express";

export interface OriginResponse {
    status: number;
    // Object type with keys and values
    headers: Record<string, string>;
    // Agnostic body type
    body: Buffer;
}

export async function forwardToOrigin(
    req: Request,
    origin: string,
): Promise<OriginResponse> {
    const targetUrl = new URL(req.originalUrl, origin);

    const {
        host,
        "content-length": _contentLength,
        ...forwardHeaders
    } = req.headers;

    // Converts to a boolean value
    const hasBody = !["GET", "HEAD"].includes(req.body);

    const response = await fetch(targetUrl, {
        method: req.method,
        headers: forwardHeaders as HeadersInit,
        ...(hasBody ? { body: JSON.stringify(req.body) } : {}),
    });

    const bodyBuffer = Buffer.from(await response.arrayBuffer());

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        headers[key] = value;
    });

    return {
        status: response.status,
        headers,
        body: bodyBuffer,
    };
}
