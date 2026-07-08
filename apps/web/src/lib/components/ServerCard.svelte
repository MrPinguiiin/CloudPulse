<script lang="ts">
  import { goto } from "$app/navigation";
  import ServerStatusBadge from "./ServerStatusBadge.svelte";

  interface ServerInfo {
    id: string;
    hostname: string;
    ip: string;
    port: number;
    type: string;
    provider: string | null;
    location: string | null;
    status: string;
    osName: string | null;
    osVersion: string | null;
    kernel: string | null;
  }

  interface MetricInfo {
    cpuUsage: number;
    ramUsagePct: number;
    diskUsagePct: number;
    networkRx: number | bigint;
    networkTx: number | bigint;
    uptime: number | bigint;
  }

  interface Props {
    server: ServerInfo;
    latestMetric?: MetricInfo | null;
  }

  const { server, latestMetric }: Props = $props();

  function formatBytes(bytes: number | bigint): string {
    const n = Number(bytes);
    if (n >= 1e12) return (n / 1e12).toFixed(1) + " TB";
    if (n >= 1e9) return (n / 1e9).toFixed(1) + " GB";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + " MB";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + " KB";
    return n + " B";
  }

  function formatUptime(seconds: number | bigint): string {
    const s = Number(seconds);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  function cpuColor(usage: number): string {
    if (usage > 90) return "text-destructive";
    if (usage > 70) return "text-amber-400";
    return "text-emerald-400";
  }

  function ramColor(usage: number): string {
    if (usage > 90) return "text-destructive";
    if (usage > 75) return "text-amber-400";
    return "text-blue-400";
  }
</script>

<button
  class="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-muted/50 w-full cursor-pointer"
  onclick={() => goto(`/servers/${server.id}`)}
>
  <div class="flex items-center justify-between mb-3">
    <div>
      <h3 class="font-medium">{server.hostname}</h3>
      <p class="text-xs text-muted-foreground">{server.ip}</p>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
        {server.type}
      </span>
      <ServerStatusBadge status={(server.status as "ONLINE" | "OFFLINE")} size="sm" />
    </div>
  </div>

  {#if latestMetric}
    <div class="grid grid-cols-3 gap-3 text-center">
      <div>
        <p class="text-lg font-semibold tabular-nums {cpuColor(latestMetric.cpuUsage)}">
          {latestMetric.cpuUsage.toFixed(1)}%
        </p>
        <p class="text-[10px] text-muted-foreground">CPU</p>
      </div>
      <div>
        <p class="text-lg font-semibold tabular-nums {ramColor(latestMetric.ramUsagePct)}">
          {latestMetric.ramUsagePct.toFixed(1)}%
        </p>
        <p class="text-[10px] text-muted-foreground">RAM</p>
      </div>
      <div>
        <p class="text-lg font-semibold tabular-nums text-foreground">
          {latestMetric.diskUsagePct.toFixed(1)}%
        </p>
        <p class="text-[10px] text-muted-foreground">Disk</p>
      </div>
    </div>

    <div class="mt-2 flex justify-between text-[10px] text-muted-foreground/60">
      <span>Net: {formatBytes(latestMetric.networkRx)}↓ {formatBytes(latestMetric.networkTx)}↑</span>
      <span>Up: {formatUptime(latestMetric.uptime)}</span>
    </div>
  {:else}
    <p class="text-sm text-muted-foreground">No metrics yet</p>
  {/if}
</button>
