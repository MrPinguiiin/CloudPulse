import { subscribe } from "./ws";
import { orpc } from "./orpc";

interface LiveMetric {
  cpuUsage: number;
  cpuCores: number;
  ramUsagePct: number;
  ramTotal: number;
  ramUsed: number;
  diskUsagePct: number;
  diskTotal: number;
  diskUsed: number;
  networkRx: number;
  networkTx: number;
  networkRxSpeed: number | null;
  networkTxSpeed: number | null;
  uptime: number;
  loadAvg1m: number | null;
  temperature: number | null;
  timestamp: string;
}

type MetricMap = Map<string, LiveMetric>;
type StatusMap = Map<string, string>;

let metricsStore = $state<MetricMap>(new Map());
let statusStore = $state<StatusMap>(new Map());
let initialized = $state(false);
let pollTimer: ReturnType<typeof setInterval> | null = null;

function init() {
  if (initialized) return;
  initialized = true;

  subscribe("metric:update", (msg) => {
    const { serverId, data } = msg;
    if (!serverId || !data) return;
    const newMap = new Map(metricsStore);
    newMap.set(serverId as string, data as unknown as LiveMetric);
    metricsStore = newMap;
  });

  subscribe("server:status", (msg) => {
    const { serverId, status } = msg;
    if (!serverId || !status) return;
    const newMap = new Map(statusStore);
    newMap.set(serverId as string, status as string);
    statusStore = newMap;
  });

  startPolling();
}

async function poll() {
  try {
    const servers = await orpc.monitoring.serverList.call();
    if (!Array.isArray(servers)) return;

    const newMetrics = new Map<string, LiveMetric>();
    const newStatuses = new Map<string, string>();

    for (const server of servers as Array<Record<string, unknown>>) {
      const m = (server as any).metrics?.[0];
      if (m) {
        newMetrics.set(server.id as string, {
          cpuUsage: m.cpuUsage ?? 0,
          cpuCores: m.cpuCores ?? 0,
          ramUsagePct: m.ramUsagePct ?? 0,
          ramTotal: Number(m.ramTotal ?? 0),
          ramUsed: Number(m.ramUsed ?? 0),
          diskUsagePct: m.diskUsagePct ?? 0,
          diskTotal: Number(m.diskTotal ?? 0),
          diskUsed: Number(m.diskUsed ?? 0),
          networkRx: Number(m.networkRx ?? 0),
          networkTx: Number(m.networkTx ?? 0),
          networkRxSpeed: (m.networkRxSpeed ?? null) as number | null,
          networkTxSpeed: (m.networkTxSpeed ?? null) as number | null,
          uptime: Number(m.uptime ?? 0),
          loadAvg1m: (m.loadAvg1m ?? null) as number | null,
          temperature: (m.temperature ?? null) as number | null,
          timestamp: String(m.timestamp ?? ""),
        });
      }
      newStatuses.set(server.id as string, server.status as string);
    }

    if (newMetrics.size > 0) metricsStore = newMetrics;
    if (newStatuses.size > 0) statusStore = newStatuses;
  } catch {}
}

function startPolling() {
  if (pollTimer) return;
  poll();
  pollTimer = setInterval(poll, 1000);
}

export function useLiveMetrics() {
  init();
  return {
    get metrics() { return metricsStore; },
    get statuses() { return statusStore; },
    getMetric(serverId: string): LiveMetric | undefined {
      return metricsStore.get(serverId);
    },
    getStatus(serverId: string): string | undefined {
      return statusStore.get(serverId);
    },
  };
}
