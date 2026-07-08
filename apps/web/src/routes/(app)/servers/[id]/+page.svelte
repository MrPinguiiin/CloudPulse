<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { orpc } from '$lib/orpc';
	import { useLiveMetrics } from '$lib/metrics-store.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import MetricGauge from '$lib/components/MetricGauge.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import ServerStatusBadge from '$lib/components/ServerStatusBadge.svelte';

	const sessionQuery = authClient.useSession();
	const serverId = $derived($page.params.id as string);
	const live = useLiveMetrics();

	const serverQuery = createQuery(() =>
		orpc.monitoring.serverGet.queryOptions({ input: { serverId } }),
	);

	const historyQuery = createQuery(() =>
		orpc.monitoring.metricHistory.queryOptions({ input: { serverId, hours: 24 } }),
	);

	const alertsQuery = createQuery(() =>
		orpc.monitoring.alertList.queryOptions({ input: { serverId } }),
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

	const currentStatus = $derived(
		(live.getStatus(serverId) as "ONLINE" | "OFFLINE" | undefined) ??
			(serverQuery.data?.status as "ONLINE" | "OFFLINE"),
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

	function severityColor(severity: string): string {
		if (severity === 'CRITICAL') return 'text-red-400';
		if (severity === 'WARNING') return 'text-yellow-400';
		return 'text-blue-400';
	}
</script>

{#if $sessionQuery.isPending || serverQuery.isLoading}
	<div class="flex items-center justify-center h-full">
		<p class="text-neutral-500">Loading...</p>
	</div>
{:else if !$sessionQuery.data}
	<div class="flex items-center justify-center h-full">
		<p class="text-neutral-500">Redirecting...</p>
	</div>
{:else if serverQuery.data}
	<div class="container mx-auto max-w-6xl px-4 py-6">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<a href="/dashboard" class="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
					&larr; Servers
				</a>
				<h1 class="text-2xl font-semibold">{serverQuery.data.hostname}</h1>
				<div class="flex items-center gap-3 mt-1">
					<span class="text-sm text-neutral-500">{serverQuery.data.ip}</span>
					<span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 uppercase">
						{serverQuery.data.type}
					</span>
					{#if currentStatus}
						<ServerStatusBadge status={currentStatus} size="sm" />
					{/if}
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

			<div class="col-span-2">
				<div class="rounded-lg border border-neutral-800 p-4">
					<h2 class="text-sm font-medium text-neutral-400 mb-4">Current</h2>
					<div class="flex flex-wrap justify-center gap-8">
						<MetricGauge label="CPU" value={metric?.cpuUsage ?? 0} color="text-green-400" />
						<MetricGauge label="RAM" value={metric?.ramUsagePct ?? 0} color="text-blue-400" />
						<MetricGauge label="Disk" value={metric?.diskUsagePct ?? 0} color="text-purple-400" />
					</div>
				</div>
			</div>

			<div>
				<div class="rounded-lg border border-neutral-800 p-4">
					<h2 class="text-sm font-medium text-neutral-400 mb-3">System Info</h2>
					<div class="grid grid-cols-2 gap-2 text-sm">
						<p class="text-neutral-500">OS</p>
						<p>{serverQuery.data.osName ?? '—'} {serverQuery.data.osVersion ?? ''}</p>
						<p class="text-neutral-500">Kernel</p>
						<p>{serverQuery.data.kernel ?? '—'}</p>
						<p class="text-neutral-500">Provider</p>
						<p>{serverQuery.data.provider ?? '—'}</p>
						<p class="text-neutral-500">Location</p>
						<p>{serverQuery.data.location ?? '—'}</p>
						<p class="text-neutral-500">Port</p>
						<p>{serverQuery.data.port}</p>
					</div>
				</div>
			</div>

			<div>
				<div class="rounded-lg border border-neutral-800 p-4">
					<h2 class="text-sm font-medium text-neutral-400 mb-3">Resources</h2>
					<div class="grid grid-cols-2 gap-2 text-sm">
						<p class="text-neutral-500">RAM</p>
						<p>
							{metric ? formatBytes(metric.ramUsed) : '—'} / {metric ? formatBytes(metric.ramTotal) : '—'}
						</p>
						<p class="text-neutral-500">Disk</p>
						<p>
							{metric ? formatBytes(metric.diskUsed) : '—'} / {metric ? formatBytes(metric.diskTotal) : '—'}
						</p>
						<p class="text-neutral-500">Uptime</p>
						<p>{metric ? formatUptime(metric.uptime) : '—'}</p>
						<p class="text-neutral-500">Load (1m)</p>
						<p>{metric?.loadAvg1m ? metric.loadAvg1m.toFixed(2) : '—'}</p>
						<p class="text-neutral-500">Temperature</p>
						<p>{metric?.temperature ? `${metric.temperature.toFixed(1)}°C` : '—'}</p>
					</div>
				</div>
			</div>

			<div class="col-span-2">
				<div class="rounded-lg border border-neutral-800 p-4">
					<h2 class="text-sm font-medium text-neutral-400 mb-3">CPU History (24h)</h2>
					<LineChart
						data={chartData.map((d) => ({ timestamp: d.timestamp, value: d.cpu }))}
						color="#4ade80"
						label="CPU"
						maxY={100}
						height={160}
					/>
				</div>
			</div>

			<div class="col-span-2">
				<div class="rounded-lg border border-neutral-800 p-4">
					<h2 class="text-sm font-medium text-neutral-400 mb-3">RAM History (24h)</h2>
					<LineChart
						data={chartData.map((d) => ({ timestamp: d.timestamp, value: d.ram }))}
						color="#60a5fa"
						label="RAM"
						maxY={100}
						height={160}
					/>
				</div>
			</div>

			<div class="col-span-2">
				<div class="rounded-lg border border-neutral-800 p-4">
					<h2 class="text-sm font-medium text-neutral-400 mb-3">Alerts</h2>
					{#if alertsQuery.data && alertsQuery.data.length > 0}
						<div class="space-y-2">
							{#each alertsQuery.data as alert}
								<div class="flex items-center justify-between rounded-md bg-neutral-900 px-3 py-2">
									<div class="flex items-center gap-2">
										<span class="text-xs uppercase font-mono {severityColor(alert.severity)}">
											{alert.severity}
										</span>
										<span class="text-sm">{alert.message}</span>
									</div>
									<span class="text-xs text-neutral-600">
										{new Date(alert.createdAt).toLocaleString()}
									</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-neutral-600">No alerts</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
