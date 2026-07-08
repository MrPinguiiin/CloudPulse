import { z } from "zod";

export const agentRegisterSchema = z.object({
  hostname: z.string().min(1),
  ip: z.string().min(1),
  port: z.number().int().default(9170),
  osName: z.string().optional(),
  osVersion: z.string().optional(),
  kernel: z.string().optional(),
  type: z.enum(["LOCAL", "CLOUD"]).default("LOCAL"),
  provider: z.string().optional(),
});

export const serverCreateSchema = z.object({
  hostname: z.string().min(1),
  ip: z.string().min(1),
  port: z.number().int().default(9170),
  type: z.enum(["LOCAL", "CLOUD"]).default("LOCAL"),
  provider: z.string().optional(),
  location: z.string().optional(),
});

export const serverUpdateSchema = z.object({
  hostname: z.string().min(1).optional(),
  ip: z.string().min(1).optional(),
  port: z.number().int().optional(),
  type: z.enum(["LOCAL", "CLOUD"]).optional(),
  provider: z.string().optional(),
  location: z.string().optional(),
  osName: z.string().optional().nullable(),
  osVersion: z.string().optional().nullable(),
  kernel: z.string().optional().nullable(),
});

export const metricHeartbeatSchema = z.object({
  cpuUsage: z.number(),
  cpuCores: z.number().int(),
  cpuModel: z.string().optional().nullable(),
  ramTotal: z.number(),
  ramUsed: z.number(),
  ramFree: z.number(),
  ramUsagePct: z.number(),
  diskTotal: z.number(),
  diskUsed: z.number(),
  diskFree: z.number(),
  diskUsagePct: z.number(),
  networkRx: z.number(),
  networkTx: z.number(),
  networkRxSpeed: z.number().optional().nullable(),
  networkTxSpeed: z.number().optional().nullable(),
  uptime: z.number(),
  loadAvg1m: z.number().optional().nullable(),
  loadAvg5m: z.number().optional().nullable(),
  loadAvg15m: z.number().optional().nullable(),
  temperature: z.number().optional().nullable(),
  timestamp: z.string().datetime().optional(),
});

export const alertConfigSchema = z.object({
  cpuThreshold: z.number().min(0).max(100).optional(),
  ramThreshold: z.number().min(0).max(100).optional(),
  diskThreshold: z.number().min(0).max(100).optional(),
  enabled: z.boolean().optional(),
});

export const metricHistoryQuery = z.object({
  hours: z.number().int().min(1).max(720).default(24),
});

export const serverIdParams = z.object({
  serverId: z.string().uuid(),
});
