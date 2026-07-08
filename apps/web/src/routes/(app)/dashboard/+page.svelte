<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { orpc } from '$lib/orpc';
	import { useLiveMetrics } from '$lib/metrics-store.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import ServerCard from '$lib/components/ServerCard.svelte';

	const sessionQuery = authClient.useSession();
	const serverList = createQuery(() => orpc.monitoring.serverList.queryOptions());
	const live = useLiveMetrics();

	$effect(() => {
		if (!$sessionQuery.isPending && !$sessionQuery.data) {
			goto('/login');
		}
	});
</script>

{#if $sessionQuery.isPending}
	<div class="flex items-center justify-center h-full">
		<p class="text-neutral-500">Loading...</p>
	</div>
{:else if !$sessionQuery.data}
	<div class="flex items-center justify-center h-full">
		<p class="text-neutral-500">Redirecting...</p>
	</div>
{:else}
	<div class="container mx-auto max-w-6xl px-4 py-6">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-semibold">Servers</h1>
				<p class="text-sm text-neutral-500">
					{$sessionQuery.data.user.name} &middot;
					{serverList.data?.length ?? 0} servers
				</p>
			</div>
		</div>

		{#if serverList.isLoading}
			<div class="flex items-center justify-center py-20">
				<p class="text-neutral-500">Loading servers...</p>
			</div>
		{:else if serverList.data && serverList.data.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each serverList.data as server}
					{@const liveMetric = live.getMetric(server.id)}
					{@const metric = liveMetric ?? (server.metrics?.[0] ? {
						cpuUsage: server.metrics[0].cpuUsage,
						ramUsagePct: server.metrics[0].ramUsagePct,
						diskUsagePct: server.metrics[0].diskUsagePct,
						networkRx: Number(server.metrics[0].networkRx),
						networkTx: Number(server.metrics[0].networkTx),
						uptime: Number(server.metrics[0].uptime),
					} : null)}
					<ServerCard server={server} latestMetric={metric} />
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<p class="text-neutral-500 mb-2">No servers added yet</p>
				<p class="text-sm text-neutral-600">Create a server to start monitoring.</p>
			</div>
		{/if}
	</div>
{/if}
