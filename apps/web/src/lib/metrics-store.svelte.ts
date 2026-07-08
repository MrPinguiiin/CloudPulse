import { subscribe } from "./ws";

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

interface ServerStatus {
  serverId: string;
  status: string;
}

type MetricMap = Map<string, LiveMetric>;
type StatusMap = Map<string, string>;

let metricsStore = $state<MetricMap>(new Map());
let statusStore = $state<StatusMap>(new Map());
let initialized = $state(false);

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
