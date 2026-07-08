import si from "systeminformation";
import { loadavg } from "node:os";

export interface SystemMetrics {
  cpuUsage: number;
  cpuCores: number;
  cpuModel: string | null;
  ramTotal: number;
  ramUsed: number;
  ramFree: number;
  ramUsagePct: number;
  diskTotal: number;
  diskUsed: number;
  diskFree: number;
  diskUsagePct: number;
  networkRx: number;
  networkTx: number;
  networkRxSpeed: number | null;
  networkTxSpeed: number | null;
  uptime: number;
  loadAvg1m: number | null;
  loadAvg5m: number | null;
  loadAvg15m: number | null;
  temperature: number | null;
  timestamp: string;
}

export async function collectMetrics(): Promise<SystemMetrics> {
  const [
    cpuLoad,
    cpuInfo,
    mem,
    disk,
    netStats,
    timeInfo,
    loadInfo,
    tempInfo,
  ] = await Promise.all([
    si.currentLoad(),
    si.cpu(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
    si.time(),
    si.currentLoad(),
    si.cpuTemperature(),
  ]);

  const mainDisk = disk[0];
  const mainNet = netStats[0];

  const now = new Date();

  return {
    cpuUsage: Math.round(cpuLoad.currentLoad * 100) / 100,
    cpuCores: cpuInfo.cores,
    cpuModel: cpuInfo.manufacturer && cpuInfo.brand
      ? `${cpuInfo.manufacturer} ${cpuInfo.brand}`
      : null,
    ramTotal: mem.total,
    ramUsed: mem.used,
    ramFree: mem.free,
    ramUsagePct: Math.round(((mem.used / mem.total) * 100) * 100) / 100,
    diskTotal: mainDisk?.size ?? 0,
    diskUsed: mainDisk?.used ?? 0,
    diskFree: mainDisk?.available ?? 0,
    diskUsagePct: mainDisk ? Math.round(((mainDisk.used / mainDisk.size) * 100) * 100) / 100 : 0,
    networkRx: mainNet?.rx_bytes ?? 0,
    networkTx: mainNet?.tx_bytes ?? 0,
    networkRxSpeed: mainNet?.rx_sec ?? null,
    networkTxSpeed: mainNet?.tx_sec ?? null,
    uptime: timeInfo.uptime,
    loadAvg1m: loadInfo.avgLoad ?? null,
    loadAvg5m: loadavg()[1] ?? null,
    loadAvg15m: loadavg()[2] ?? null,
    temperature: tempInfo.main ?? null,
    timestamp: now.toISOString(),
  };
}
