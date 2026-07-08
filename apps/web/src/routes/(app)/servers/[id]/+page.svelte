<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { orpc } from '$lib/orpc';
	import { useLiveMetrics } from '$lib/metrics-store.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import MetricGauge from '$lib/components/MetricGauge.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import { Activity, Zap, Cpu, HardDrive, Server } from 'lucide-svelte';
	import InfoRow from '$lib/components/InfoRow.svelte';

	const sessionQuery = authClient.useSession();
	const serverId = $derived($page.params.id as string);
	const live = useLiveMetrics();

	const serverQuery = createQuery(() =>
		orpc.monitoring.serverGet.queryOptions({ input: { serverId } }),
	);

	const historyQuery = createQuery(() =>
		orpc.monitoring.metricHistory.queryOptions({ input: { serverId, hours: 24 }, refetchInterval: 1000 }),
	);

	$effect(() => {
		if (!$sessionQuery.isPending && !$sessionQuery.data) {
			goto('/login');
		}
	});

	const liveMetric = $derived(live.getMetric(serverId));

	const metric = $derived(
		liveMetric ??
			(serverQuery.data?.metrics?.[0]
				? {
						cpuUsage: serverQuery.data.metrics[0].cpuUsage,
						ramUsagePct: serverQuery.data.metrics[0].ramUsagePct,
						diskUsagePct: serverQuery.data.metrics[0].diskUsagePct,
						networkRx: Number(serverQuery.data.metrics[0].networkRx),
						networkTx: Number(serverQuery.data.metrics[0].networkTx),
						uptime: Number(serverQuery.data.metrics[0].uptime),
						ramUsed: Number(serverQuery.data.metrics[0].ramUsed),
						ramTotal: Number(serverQuery.data.metrics[0].ramTotal),
						diskUsed: Number(serverQuery.data.metrics[0].diskUsed),
						diskTotal: Number(serverQuery.data.metrics[0].diskTotal),
						loadAvg1m: serverQuery.data.metrics[0].loadAvg1m,
						temperature: serverQuery.data.metrics[0].temperature,
					}
				: null),
	);

	const chartData = $derived(
		(historyQuery.data ?? []).map((m) => ({
			timestamp: new Date(m.timestamp).toLocaleTimeString(),
			cpu: m.cpuUsage,
			ram: m.ramUsagePct,
			disk: m.diskUsagePct,
		})),
	);

	const status = $derived(
		(live.getStatus(serverId) as string | undefined) ?? serverQuery.data?.status ?? "OFFLINE",
	);

	function formatBytes(bytes: number): string {
		if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
		if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
		if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return bytes + ' B';
	}

	function formatUptime(seconds: number): string {
		const d = Math.floor(seconds / 86400);
		const h = Math.floor((seconds % 86400) / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		if (d > 0) return `${d}d ${h}h ${m}m`;
		if (h > 0) return `${h}h ${m}m`;
		return `${m}m`;
	}
</script>

{#if $sessionQuery.isPending || serverQuery.isLoading}
	<div class="flex items-center justify-center h-full p-8">
		<p class="text-muted-foreground">Loading...</p>
	</div>
{:else if !$sessionQuery.data}
	<div class="flex items-center justify-center h-full p-8">
		<p class="text-muted-foreground">Redirecting...</p>
	</div>
{:else if serverQuery.data}
	<div class="min-h-full bg-gradient-to-br from-background to-muted/30 p-8">
		<div class="mx-auto max-w-7xl">

			<header class="flex items-center justify-between mb-8">
				<div>
					<a href="/dashboard" class="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Servers</a>
					<h1 class="text-3xl font-bold text-foreground mt-1 mb-1">{serverQuery.data.hostname}</h1>
				</div>
				<div class="flex items-center gap-3">
					<div class="px-4 py-2 bg-card text-foreground text-sm font-mono rounded-lg border border-border">
						{serverQuery.data.ip}
					</div>
					<div class="flex items-center gap-2 px-3 py-2 {status === 'ONLINE' ? 'bg-emerald-500/10' : 'bg-muted'} rounded-lg border {status === 'ONLINE' ? 'border-emerald-500/20' : 'border-border'}">
						<div class="w-2 h-2 rounded-full {status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}"></div>
						<span class="text-xs font-medium {status === 'ONLINE' ? 'text-emerald-400' : 'text-muted-foreground'}">{status}</span>
					</div>
				</div>
			</header>

			<section class="mb-8">
				<h2 class="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Current Status</h2>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-8 bg-card p-8 rounded-2xl border border-border shadow-sm">
					<MetricGauge
						label="CPU"
						value={metric?.cpuUsage ?? 0}
						gradientFrom="#10b981"
						gradientTo="#059669"
					/>
					<MetricGauge
						label="RAM"
						value={metric?.ramUsagePct ?? 0}
						gradientFrom="#3b82f6"
						gradientTo="#2563eb"
					/>
					<MetricGauge
						label="Disk"
						value={metric?.diskUsagePct ?? 0}
						gradientFrom="#a78bfa"
						gradientTo="#8b5cf6"
					/>
					<MetricGauge
						label="Temp"
						value={metric?.temperature ?? 0}
						max={100}
						unit="°C"
						gradientFrom="#f97316"
						gradientTo="#ef4444"
					/>
				</div>
			</section>

			<section class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				<div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
					<div class="flex items-center gap-2 mb-6">
						<Activity class="w-5 h-5 text-muted-foreground" />
						<h3 class="text-lg font-semibold text-foreground">System Information</h3>
					</div>
					<div>
						<InfoRow label="Operating System" value={serverQuery.data.osName ? `${serverQuery.data.osName} ${serverQuery.data.osVersion ?? ''}` : '—'} />
						<InfoRow label="Kernel" value={serverQuery.data.kernel ?? '—'} />
						<InfoRow label="Provider" value={serverQuery.data.provider ?? 'Laptop'} />
						<InfoRow label="Location" value={serverQuery.data.location ?? 'Local'} />
						<InfoRow label="Port" value={String(serverQuery.data.port)} last />
					</div>
				</div>

				<div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
					<div class="flex items-center gap-2 mb-6">
						<Zap class="w-5 h-5 text-muted-foreground" />
						<h3 class="text-lg font-semibold text-foreground">Resource Details</h3>
					</div>
					<div>
						<InfoRow label="RAM" value={metric ? `${formatBytes(metric.ramUsed)} / ${formatBytes(metric.ramTotal)}` : '—'} />
						<InfoRow label="Disk" value={metric ? `${formatBytes(metric.diskUsed)} / ${formatBytes(metric.diskTotal)}` : '—'} />
						<InfoRow label="Uptime" value={metric ? formatUptime(metric.uptime) : '—'} />
						<InfoRow label="Load (1m)" value={metric?.loadAvg1m ? metric.loadAvg1m.toFixed(2) : '—'} />
						<InfoRow label="Temperature" value={metric?.temperature ? `${metric.temperature.toFixed(1)}°C` : '—'} last />
					</div>
				</div>
			</section>

			<section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
					<h3 class="text-lg font-semibold text-foreground mb-6">CPU History (24h)</h3>
					<LineChart
						data={chartData.map((d) => ({ timestamp: d.timestamp, value: d.cpu }))}
						color="#10b981"
						label="CPU"
						maxY={100}
						height={200}
					/>
				</div>
				<div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
					<h3 class="text-lg font-semibold text-foreground mb-6">RAM History (24h)</h3>
					<LineChart
						data={chartData.map((d) => ({ timestamp: d.timestamp, value: d.ram }))}
						color="#3b82f6"
						label="RAM"
						maxY={100}
						height={200}
					/>
				</div>
			</section>
		</div>
	</div>
{/if}
