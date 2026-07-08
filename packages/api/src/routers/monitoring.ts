import { randomUUID } from "node:crypto";
import { ORPCError } from "@orpc/server";
import prisma from "@monitoring-server/db";
import { z } from "zod";

import { serializeBigInt } from "../lib/metric-serializer";
import { agentProcedure, protectedProcedure } from "../index";
import {
  alertConfigSchema,
  agentRegisterSchema,
  metricHeartbeatSchema,
  serverCreateSchema,
  serverIdParams,
  serverUpdateSchema,
} from "./schemas";

const WS_CLIENTS = new Set<(data: string) => void>();

export function broadcastMetric(serverId: string, data: Record<string, unknown>) {
  const message = JSON.stringify({ type: "metric:update", serverId, data });
  for (const send of WS_CLIENTS) {
    try {
      send(message);
    } catch {
      WS_CLIENTS.delete(send);
    }
  }
}

export function broadcastServerStatus(serverId: string, status: string) {
  const message = JSON.stringify({ type: "server:status", serverId, status });
  for (const send of WS_CLIENTS) {
    try {
      send(message);
    } catch {
      WS_CLIENTS.delete(send);
    }
  }
}

export function broadcastAlert(serverId: string, alert: Record<string, unknown>) {
  const message = JSON.stringify({ type: "alert:triggered", serverId, data: alert });
  for (const send of WS_CLIENTS) {
    try {
      send(message);
    } catch {
      WS_CLIENTS.delete(send);
    }
  }
}

export function addWsClient(send: (data: string) => void) {
  WS_CLIENTS.add(send);
}

export function removeWsClient(send: (data: string) => void) {
  WS_CLIENTS.delete(send);
}

export const monitoringRouter = {
  agentRegister: agentProcedure
    .input(agentRegisterSchema)
    .handler(async ({ input, context }) => {
      const server = await prisma.server.findUnique({
        where: { id: context.agent!.serverId },
      });

      const updated = await prisma.server.update({
        where: { id: context.agent!.serverId },
        data: {
          hostname: input.hostname,
          ip: input.ip,
          port: input.port,
          osName: input.osName ?? server?.osName,
          osVersion: input.osVersion ?? server?.osVersion,
          kernel: input.kernel ?? server?.kernel,
          type: input.type,
          provider: input.provider ?? server?.provider,
          lastSeenAt: new Date(),
        },
      });

      return serializeBigInt(updated);
    }),

  agentHeartbeat: agentProcedure
    .input(metricHeartbeatSchema)
    .handler(async ({ input, context }) => {
      const serverId = context.agent!.serverId;

      const metric = await prisma.metric.create({
        data: {
          serverId,
          cpuUsage: input.cpuUsage,
          cpuCores: input.cpuCores,
          cpuModel: input.cpuModel,
          ramTotal: BigInt(input.ramTotal),
          ramUsed: BigInt(input.ramUsed),
          ramFree: BigInt(input.ramFree),
          ramUsagePct: input.ramUsagePct,
          diskTotal: BigInt(input.diskTotal),
          diskUsed: BigInt(input.diskUsed),
          diskFree: BigInt(input.diskFree),
          diskUsagePct: input.diskUsagePct,
          networkRx: BigInt(input.networkRx),
          networkTx: BigInt(input.networkTx),
          networkRxSpeed: input.networkRxSpeed,
          networkTxSpeed: input.networkTxSpeed,
          uptime: BigInt(input.uptime),
          loadAvg1m: input.loadAvg1m,
          loadAvg5m: input.loadAvg5m,
          loadAvg15m: input.loadAvg15m,
          temperature: input.temperature,
          timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
        },
      });

      await prisma.server.update({
        where: { id: serverId },
        data: {
          status: "ONLINE",
          lastSeenAt: new Date(),
          osName: input.cpuModel ?? undefined,
        },
      });

      await checkAlerts(serverId, input.cpuUsage, input.ramUsagePct, input.diskUsagePct);

      const serialized = serializeBigInt(metric);
      broadcastMetric(serverId, serialized as unknown as Record<string, unknown>);

      return { received: true };
    }),

  serverList: protectedProcedure.handler(async ({ context }) => {
    const servers = await prisma.server.findMany({
      where: { userId: context.session!.user.id },
      include: {
        metrics: { orderBy: { timestamp: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    return serializeBigInt(servers);
  }),

  serverGet: protectedProcedure.input(serverIdParams).handler(async ({ input, context }) => {
    const server = await prisma.server.findFirst({
      where: { id: input.serverId, userId: context.session!.user.id },
      include: {
        metrics: { orderBy: { timestamp: "desc" }, take: 1 },
        alertConfig: true,
      },
    });

    if (!server) throw new ORPCError("NOT_FOUND", { message: "Server not found" });

    return serializeBigInt(server);
  }),

  serverCreate: protectedProcedure.input(serverCreateSchema).handler(async ({ input, context }) => {
    const agentToken = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");

    const server = await prisma.server.create({
      data: {
        hostname: input.hostname,
        ip: input.ip,
        port: input.port,
        type: input.type,
        provider: input.provider,
        location: input.location,
        agentToken,
        userId: context.session!.user.id,
      },
    });

    await prisma.alertConfig.create({
      data: { serverId: server.id },
    });

    return serializeBigInt(server);
  }),

  serverUpdate: protectedProcedure
    .input(serverIdParams.merge(serverUpdateSchema))
    .handler(async ({ input, context }) => {
      const { serverId, ...data } = input;

      const server = await prisma.server.findFirst({
        where: { id: serverId, userId: context.session!.user.id },
      });
      if (!server) throw new ORPCError("NOT_FOUND");

      const updated = await prisma.server.update({
        where: { id: serverId },
        data,
      });

      return serializeBigInt(updated);
    }),

  serverDelete: protectedProcedure.input(serverIdParams).handler(async ({ input, context }) => {
    const server = await prisma.server.findFirst({
      where: { id: input.serverId, userId: context.session!.user.id },
    });
    if (!server) throw new ORPCError("NOT_FOUND");

    await prisma.server.delete({ where: { id: input.serverId } });

    return { deleted: true };
  }),

  serverRegenerateToken: protectedProcedure
    .input(serverIdParams)
    .handler(async ({ input, context }) => {
      const server = await prisma.server.findFirst({
        where: { id: input.serverId, userId: context.session!.user.id },
      });
      if (!server) throw new ORPCError("NOT_FOUND");

      const agentToken = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
      await prisma.server.update({
        where: { id: input.serverId },
        data: { agentToken },
      });

      return { token: agentToken };
    }),

  metricLatest: protectedProcedure.input(serverIdParams).handler(async ({ input, context }) => {
    const server = await prisma.server.findFirst({
      where: { id: input.serverId, userId: context.session!.user.id },
    });
    if (!server) throw new ORPCError("NOT_FOUND");

    const metric = await prisma.metric.findFirst({
      where: { serverId: input.serverId },
      orderBy: { timestamp: "desc" },
    });

    return metric ? serializeBigInt(metric) : null;
  }),

  metricHistory: protectedProcedure
    .input(
      serverIdParams.merge(
        z.object({
          hours: z.number().int().min(1).max(720).default(24),
        }),
      ),
    )
    .handler(async ({ input, context }) => {
      const server = await prisma.server.findFirst({
        where: { id: input.serverId, userId: context.session!.user.id },
      });
      if (!server) throw new ORPCError("NOT_FOUND");

      const since = new Date(Date.now() - input.hours * 60 * 60 * 1000);

      const metrics = await prisma.metric.findMany({
        where: {
          serverId: input.serverId,
          timestamp: { gte: since },
        },
        orderBy: { timestamp: "asc" },
      });

      return serializeBigInt(metrics);
    }),

  alertList: protectedProcedure
    .input(serverIdParams.optional())
    .handler(async ({ input, context }) => {
      const where: Record<string, unknown> = {};

      if (input?.serverId) {
        const server = await prisma.server.findFirst({
          where: { id: input.serverId, userId: context.session!.user.id },
        });
        if (!server) throw new ORPCError("NOT_FOUND");
        where.serverId = input.serverId;
      } else {
        const userServers = await prisma.server.findMany({
          where: { userId: context.session!.user.id },
          select: { id: true },
        });
        where.serverId = { in: userServers.map((s) => s.id) };
      }

      const alerts = await prisma.alert.findMany({
        where,
        include: { server: { select: { hostname: true, ip: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return serializeBigInt(alerts);
    }),

  alertConfigGet: protectedProcedure.input(serverIdParams).handler(async ({ input, context }) => {
    const server = await prisma.server.findFirst({
      where: { id: input.serverId, userId: context.session!.user.id },
    });
    if (!server) throw new ORPCError("NOT_FOUND");

    let config = await prisma.alertConfig.findUnique({
      where: { serverId: input.serverId },
    });

    if (!config) {
      config = await prisma.alertConfig.create({
        data: { serverId: input.serverId },
      });
    }

    return config;
  }),

  alertConfigUpdate: protectedProcedure
    .input(serverIdParams.merge(alertConfigSchema))
    .handler(async ({ input, context }) => {
      const { serverId, ...data } = input;

      const server = await prisma.server.findFirst({
        where: { id: serverId, userId: context.session!.user.id },
      });
      if (!server) throw new ORPCError("NOT_FOUND");

      const config = await prisma.alertConfig.upsert({
        where: { serverId },
        create: { serverId, ...data },
        update: data,
      });

      return config;
    }),
};

async function checkAlerts(
  serverId: string,
  cpuUsage: number,
  ramUsagePct: number,
  diskUsagePct: number,
) {
  const config = await prisma.alertConfig.findUnique({ where: { serverId } });
  if (!config?.enabled) return;

  const checks: { type: string; value: number; threshold: number }[] = [
    { type: "cpu", value: cpuUsage, threshold: config.cpuThreshold },
    { type: "ram", value: ramUsagePct, threshold: config.ramThreshold },
    { type: "disk", value: diskUsagePct, threshold: config.diskThreshold },
  ];

  for (const check of checks) {
    if (check.value >= check.threshold) {
      const severity = check.value >= check.threshold + 10 ? "CRITICAL" : "WARNING";
      const recentAlert = await prisma.alert.findFirst({
        where: {
          serverId,
          type: check.type,
          resolvedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!recentAlert) {
        const alert = await prisma.alert.create({
          data: {
            serverId,
            type: check.type,
            severity: severity as "WARNING" | "CRITICAL",
            threshold: check.threshold,
            currentValue: check.value,
            message: `${check.type.toUpperCase()} usage at ${check.value.toFixed(1)}% (threshold: ${check.threshold}%)`,
          },
        });

        broadcastAlert(serverId, serializeBigInt(alert) as unknown as Record<string, unknown>);
      }
    } else {
      await prisma.alert.updateMany({
        where: {
          serverId,
          type: check.type,
          resolvedAt: null,
        },
        data: { resolvedAt: new Date() },
      });
    }
  }
}
