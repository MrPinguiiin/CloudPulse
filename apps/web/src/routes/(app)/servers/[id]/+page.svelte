<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { orpc } from '$lib/orpc';
	import { useLiveMetrics } from '$lib/metrics-store.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import MetricGauge from '$lib/components/MetricGauge.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Activity, Server, Download, Upload, Gauge } from 'lucide-svelte';
	import InfoRow from '$lib/components/InfoRow.svelte';

	const sessionQuery = authClient.useSession();
	const serverId = $derived($page.params.id as string);
	const live = useLiveMetrics();

	const serverQuery = createQuery(() =>
		orpc.monitoring.serverGet.queryOptions({ input: { serverId } }),
	);

	const historyQuery = createQuery(() =>
		orpc.monitoring.metricHistory.queryOptions({ input: { serverId, hours: 2 }, refetchInterval: 1000 }),
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
						cpuCores: serverQuery.data.metrics[0].cpuCores,
						cpuModel: serverQuery.data.metrics[0].cpuModel,
						ramUsagePct: serverQuery.data.metrics[0].ramUsagePct,
						diskUsagePct: serverQuery.data.metrics[0].diskUsagePct,
						networkRx: Number(serverQuery.data.metrics[0].networkRx),
						networkTx: Number(serverQuery.data.metrics[0].networkTx),
						networkRxSpeed: serverQuery.data.metrics[0].networkRxSpeed as number | null,
						networkTxSpeed: serverQuery.data.metrics[0].networkTxSpeed as number | null,
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

	function formatSpeed(bytesPerSec: number | null): string {
		if (!bytesPerSec) return '0 B/s';
		if (bytesPerSec >= 1e9) return (bytesPerSec / 1e9).toFixed(1) + ' GB/s';
		if (bytesPerSec >= 1e6) return (bytesPerSec / 1e6).toFixed(1) + ' MB/s';
		if (bytesPerSec >= 1e3) return (bytesPerSec / 1e3).toFixed(1) + ' KB/s';
		return bytesPerSec + ' B/s';
	}

	function formatUptime(seconds: number): string {
		const d = Math.floor(seconds / 86400);
		const h = Math.floor((seconds % 86400) / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		if (d > 0) return `${d}d ${h}h ${m}m`;
		if (h > 0) return `${h}h ${m}m`;
		return `${m}m`;
	}

	let speedTestRunning = $state(false);
	let speedLiveMbps = $state(0);
	let speedTestDone = $state(false);
	let peakMbps = $state(0);
	let speedTestError = $state(false);

	async function runSpeedTest() {
		speedTestRunning = true;
		speedLiveMbps = 0;
		peakMbps = 0;
		speedTestDone = false;
		speedTestError = false;

		try {
			const urls = [
				'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
				'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
				'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js',
			];

			for (const url of urls) {
				if (!speedTestRunning) break;

				const startTime = performance.now();
				let bytesReceived = 0;
				let lastUpdate = startTime;
				let lastBytes = 0;

				const response = await fetch(url + '?r=' + Math.random(), { cache: 'no-store' });
				if (!response.ok || !response.body) continue;

				const reader = response.body.getReader();

				while (true) {
					const { done, value } = await reader.read();
					if (done || !speedTestRunning) break;

					bytesReceived += value?.length ?? 0;
					const now = performance.now();
					const deltaMs = now - lastUpdate;
					if (deltaMs > 50) {
						const deltaBytes = bytesReceived - lastBytes;
						const bitsPerSec = (deltaBytes * 8) / (deltaMs / 1000);
						speedLiveMbps = bitsPerSec / 1e6;
						lastUpdate = now;
						lastBytes = bytesReceived;
					}
				}

				const totalMs = performance.now() - startTime;
				const avgMbps = (bytesReceived * 8 / (totalMs / 1000)) / 1e6;
				peakMbps = Math.max(peakMbps, avgMbps);
			}
		} catch (e) {
			console.error('Speed test error:', e);
			speedTestError = true;
		}

		speedTestRunning = false;
		speedTestDone = true;
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
				<div class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-card p-6 rounded-2xl border border-border shadow-sm">
					<MetricGauge label="CPU" value={metric?.cpuUsage ?? 0}
						detail={metric ? `${Math.round(metric.cpuUsage)}% used` : ''}
						gradientFrom="#10b981" gradientTo="#059669" />
					<MetricGauge label="RAM" value={metric?.ramUsagePct ?? 0}
						detail={metric ? `${formatBytes(metric.ramUsed)} / ${formatBytes(metric.ramTotal)}` : ''}
						gradientFrom="#3b82f6" gradientTo="#2563eb" />
					<MetricGauge label="Disk" value={metric?.diskUsagePct ?? 0}
						detail={metric ? `${formatBytes(metric.diskUsed)} / ${formatBytes(metric.diskTotal)}` : ''}
						gradientFrom="#a78bfa" gradientTo="#8b5cf6" />
					<MetricGauge label="Temp" value={metric?.temperature ?? 0} max={100} unit="°C"
						detail={metric?.temperature ? `${metric.temperature.toFixed(1)}°C` : ''}
						gradientFrom="#f97316" gradientTo="#ef4444" />
				</div>
			</section>

			<section class="mb-8">
				<h2 class="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Network</h2>
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
						<div class="flex items-center gap-2 mb-4">
							<Download class="w-5 h-5 text-sky-400" />
							<h3 class="text-lg font-semibold text-foreground">Realtime Traffic</h3>
						</div>
						<div class="grid grid-cols-2 gap-4 mb-4">
							<div class="rounded-lg bg-muted/30 p-4 text-center">
								<div class="flex items-center justify-center gap-1 text-4xl font-bold tabular-nums text-sky-400">
									<Download class="size-5 text-sky-400/60" />
									{formatSpeed(metric?.networkRxSpeed ?? null)}
								</div>
								<div class="mt-1 text-xs text-muted-foreground">Download</div>
							</div>
							<div class="rounded-lg bg-muted/30 p-4 text-center">
								<div class="flex items-center justify-center gap-1 text-4xl font-bold tabular-nums text-rose-400">
									<Upload class="size-5 text-rose-400/60" />
									{formatSpeed(metric?.networkTxSpeed ?? null)}
								</div>
								<div class="mt-1 text-xs text-muted-foreground">Upload</div>
							</div>
						</div>
						<div class="rounded-lg bg-muted/20 p-3 flex justify-between text-xs text-muted-foreground">
							<span>Total RX: {metric ? formatBytes(metric.networkRx) : '—'}</span>
							<span>Total TX: {metric ? formatBytes(metric.networkTx) : '—'}</span>
						</div>
					</div>
				</div>
			</section>

			<section class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				<div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
					<div class="flex items-center gap-2 mb-6">
						<Activity class="w-5 h-5 text-muted-foreground" />
						<h3 class="text-lg font-semibold text-foreground">System Information</h3>
					</div>
					<div>
						<InfoRow label="Operating System"
							value={serverQuery.data.osName ? `${serverQuery.data.osName} ${serverQuery.data.osVersion ?? ''}` : '—'} />
						<InfoRow label="Kernel" value={serverQuery.data.kernel ?? '—'} />
						<InfoRow label="CPU Model" value={serverQuery.data.metrics?.[0]?.cpuModel ?? '—'} />
						<InfoRow label="Cores" value={serverQuery.data.metrics?.[0]?.cpuCores ? String(serverQuery.data.metrics[0].cpuCores) : '—'} />
						<InfoRow label="Uptime" value={metric ? formatUptime(metric.uptime) : '—'} />
						<InfoRow label="Load (1m)" value={metric?.loadAvg1m ? metric.loadAvg1m.toFixed(2) : '—'} last />
					</div>
				</div>

				<div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
					<div class="flex items-center gap-2 mb-6">
						<Server class="w-5 h-5 text-muted-foreground" />
						<h3 class="text-lg font-semibold text-foreground">Server Info</h3>
					</div>
					<div>
						<InfoRow label="Type" value={serverQuery.data.type ?? '—'} />
						<InfoRow label="Provider" value={serverQuery.data.provider ?? 'Laptop'} />
						<InfoRow label="Location" value={serverQuery.data.location ?? 'Local'} />
						<InfoRow label="IP Address" value={serverQuery.data.ip} />
						<InfoRow label="Port" value={String(serverQuery.data.port)} />
						<InfoRow label="Status" value={status} last />
					</div>
				</div>
			</section>

			<section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
					<h3 class="text-lg font-semibold text-foreground mb-6">CPU History (2h)</h3>
					<LineChart data={chartData.map((d) => ({ timestamp: d.timestamp, value: d.cpu }))}
						color="#10b981" label="CPU" maxY={100} height={200} />
				</div>
				<div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
					<h3 class="text-lg font-semibold text-foreground mb-6">RAM History (2h)</h3>
					<LineChart data={chartData.map((d) => ({ timestamp: d.timestamp, value: d.ram }))}
						color="#3b82f6" label="RAM" maxY={100} height={200} />
				</div>
			</section>
		</div>
	</div>
{/if}