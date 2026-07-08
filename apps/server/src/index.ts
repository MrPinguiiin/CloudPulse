import { createContext } from "@monitoring-server/api/context";
import { appRouter } from "@monitoring-server/api/routers/index";
import { addWsClient, removeWsClient, broadcastServerStatus, broadcastMetric } from "@monitoring-server/api/routers/monitoring";
import { auth } from "@monitoring-server/auth";
import prisma from "@monitoring-server/db";
import { env } from "@monitoring-server/env/server";
import { serializeBigInt } from "@monitoring-server/api/lib/metric-serializer";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createBunWebSocket } from "hono/bun";

const { upgradeWebSocket, websocket } = createBunWebSocket();

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
  if (c.req.path === "/ws") return await next();

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

app.get("/", (c) => c.text("OK"));

app.post("/api/agent/register", async (c) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Missing token" }, 401);

  const server = await prisma.server.findUnique({ where: { agentToken: token } });
  if (!server) return c.json({ error: "Invalid token" }, 401);

  const body = await c.req.json();
  await prisma.server.update({
    where: { id: server.id },
    data: {
      hostname: body.hostname ?? server.hostname,
      ip: body.ip ?? server.ip,
      lastSeenAt: new Date(),
    },
  });

  return c.json({ id: server.id, hostname: server.hostname });
});

app.post("/api/agent/heartbeat", async (c) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Missing token" }, 401);

  const server = await prisma.server.findUnique({ where: { agentToken: token } });
  if (!server) return c.json({ error: "Invalid token" }, 401);

  const body = await c.req.json();

  const metric = await prisma.metric.create({
    data: {
      serverId: server.id,
      cpuUsage: body.cpuUsage,
      cpuCores: body.cpuCores,
      cpuModel: body.cpuModel,
      ramTotal: BigInt(body.ramTotal),
      ramUsed: BigInt(body.ramUsed),
      ramFree: BigInt(body.ramFree),
      ramUsagePct: body.ramUsagePct,
      diskTotal: BigInt(body.diskTotal),
      diskUsed: BigInt(body.diskUsed),
      diskFree: BigInt(body.diskFree),
      diskUsagePct: body.diskUsagePct,
      networkRx: BigInt(body.networkRx),
      networkTx: BigInt(body.networkTx),
      networkRxSpeed: body.networkRxSpeed,
      networkTxSpeed: body.networkTxSpeed,
      uptime: BigInt(body.uptime),
      loadAvg1m: body.loadAvg1m,
      loadAvg5m: body.loadAvg5m,
      loadAvg15m: body.loadAvg15m,
      temperature: body.temperature,
      timestamp: new Date(),
    },
  });

  await prisma.server.update({
    where: { id: server.id },
    data: {
      status: "ONLINE",
      lastSeenAt: new Date(),
      osName: body.osName ?? undefined,
      osVersion: body.osVersion ?? undefined,
      kernel: body.kernel ?? undefined,
    },
  });

  broadcastMetric(server.id, serializeBigInt(metric) as Record<string, unknown>);

  return c.json({ received: true });
});

app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onOpen(_event, ws) {
      addWsClient((data: string) => {
        ws.send(data);
      });
    },
    onMessage() {},
    onClose() {
      removeWsClient(() => {});
    },
  })),
);

export default {
  port: 3000,
  fetch: app.fetch,
  websocket,
};

const OFFLINE_TIMEOUT_MS = 30_000;

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
