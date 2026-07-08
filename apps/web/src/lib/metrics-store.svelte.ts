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
    const newMap = new Map(metricsStore);
    newMap.set(serverId as string, data as unknown as LiveMetric);
    metricsStore = newMap;
  });

  subscribe("server:status", (msg) => {
    const { serverId, status } = msg;
    const newMap = new Map(statusStore);
    newMap.set(serverId as string, status as string);
    statusStore = newMap;
  });

  startPolling();
}

async function poll() {
  try {
    const servers = await orpc.monitoring.serverList.call();
    if (!servers || !Array.isArray(servers)) return;

    const newMetrics = new Map(metricsStore);
    const newStatuses = new Map(statusStore);

    for (const server of servers) {
      const m = server.metrics?.[0];
      if (m) {
        newMetrics.set(server.id, {
          cpuUsage: m.cpuUsage,
          cpuCores: m.cpuCores,
          ramUsagePct: m.ramUsagePct,
          ramTotal: Number(m.ramTotal),
          ramUsed: Number(m.ramUsed),
          diskUsagePct: m.diskUsagePct,
          diskTotal: Number(m.diskTotal),
          diskUsed: Number(m.diskUsed),
          networkRx: Number(m.networkRx),
          networkTx: Number(m.networkTx),
          networkRxSpeed: m.networkRxSpeed,
          networkTxSpeed: m.networkTxSpeed,
          uptime: Number(m.uptime),
          loadAvg1m: m.loadAvg1m,
          temperature: m.temperature,
          timestamp: String(m.timestamp),
        });
      }
      newStatuses.set(server.id, server.status);
    }

    metricsStore = newMetrics;
    statusStore = newStatuses;
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
