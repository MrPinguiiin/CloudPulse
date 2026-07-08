import { createContext } from "@monitoring-server/api/context";
import { appRouter } from "@monitoring-server/api/routers/index";
import { addWsClient, removeWsClient, broadcastServerStatus } from "@monitoring-server/api/routers/monitoring";
import { auth } from "@monitoring-server/auth";
import prisma from "@monitoring-server/db";
import { env } from "@monitoring-server/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { ServerWebSocket } from "bun";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  if (c.req.path === "/ws") {
    return await next();
  }

  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => {
  return c.text("OK");
});

app.get("/ws", (c) => {
  const upgradeHeader = c.req.header("upgrade");
  if (upgradeHeader !== "websocket") {
    return c.text("Expected Upgrade: websocket", 426);
  }

  // @ts-expect-error — Bun.upgrade is runtime-only API
  const success = Bun.upgrade(c.req.raw, {
    data: {},
    open(ws: ServerWebSocket<unknown>) {
      addWsClient((data: string) => {
        ws.send(data);
      });
    },
    message(ws: ServerWebSocket<unknown>, message: string | Buffer) {
      if (message === "ping") {
        ws.send("pong");
      }
    },
    close(ws: ServerWebSocket<unknown>) {
      removeWsClient((data: string) => {
        ws.send(data);
      });
    },
  });

  if (!success) {
    return c.text("WebSocket upgrade failed", 500);
  }

  return c.body(null);
});

export default app;

const OFFLINE_TIMEOUT_MS = 15_000;

setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - OFFLINE_TIMEOUT_MS);
    const staleServers = await prisma.server.findMany({
      where: {
        status: "ONLINE",
        lastSeenAt: { lt: cutoff },
      },
      select: { id: true },
    });

    for (const server of staleServers) {
      await prisma.server.update({
        where: { id: server.id },
        data: { status: "OFFLINE" },
      });
      broadcastServerStatus(server.id, "OFFLINE");
    }
  } catch (err) {
    console.error("[offline-detector] Error:", err);
  }
}, OFFLINE_TIMEOUT_MS);
