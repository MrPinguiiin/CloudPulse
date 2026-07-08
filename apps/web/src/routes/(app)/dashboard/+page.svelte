<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { orpc } from '$lib/orpc';
	import { useLiveMetrics } from '$lib/metrics-store.svelte';
	import { createQuery, createMutation } from '@tanstack/svelte-query';
	import ServerCard from '$lib/components/ServerCard.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardFooter from '$lib/components/ui/card-footer.svelte';
	import { Plus, Copy, Check, Globe, HardDrive, Server as ServerIcon } from 'lucide-svelte';

	const sessionQuery = authClient.useSession();
	const serverList = createQuery(() => orpc.monitoring.serverList.queryOptions());
	const live = useLiveMetrics();

	$effect(() => {
		if (!$sessionQuery.isPending && !$sessionQuery.data) {
			goto('/login');
		}
	});

	let dialogOpen = $state(false);
	let formData = $state({ hostname: "", ip: "", type: "LOCAL" as "LOCAL" | "CLOUD", provider: "", location: "" });
	let agentToken = $state("");
	let copied = $state(false);
	let addError = $state("");

	const createMut = createMutation(() => ({
		mutationFn: async () => {
			const result = await orpc.monitoring.serverCreate.call({
				hostname: formData.hostname,
				ip: formData.ip,
				type: formData.type,
				provider: formData.provider || undefined,
				location: formData.location || undefined,
			});
			return result;
		},
		onSuccess: (data) => {
			agentToken = data.agentToken;
			addError = "";
			serverList.refetch();
		},
		onError: (err) => {
			addError = err.message || "Failed to create server";
		},
	}));

	function handleSubmit(e: Event) {
		e.preventDefault();
		createMut.mutate();
	}

	async function copyToken() {
		await navigator.clipboard.writeText(agentToken);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function resetDialog() {
		formData = { hostname: "", ip: "", type: "LOCAL", provider: "", location: "" };
		agentToken = "";
		addError = "";
	}
</script>

{#if $sessionQuery.isPending}
	<div class="flex items-center justify-center h-full p-8">
		<p class="text-muted-foreground">Loading...</p>
	</div>
{:else if !$sessionQuery.data}
	<div class="flex items-center justify-center h-full p-8">
		<p class="text-muted-foreground">Redirecting...</p>
	</div>
{:else}
	<div class="container mx-auto max-w-6xl px-4 py-6">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-semibold">Servers</h1>
				<p class="text-sm text-muted-foreground">
					{$sessionQuery.data.user.name} &middot;
					{serverList.data?.length ?? 0} servers
				</p>
			</div>
			<Button onclick={() => { resetDialog(); dialogOpen = true; }}>
				<Plus class="size-4 mr-1.5" />
				Add Server
			</Button>
		</div>

		{#if serverList.isLoading}
			<div class="flex items-center justify-center py-20">
				<p class="text-muted-foreground">Loading servers...</p>
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
				<div class="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
					<ServerIcon class="size-6 text-muted-foreground" />
				</div>
				<p class="mb-1 font-medium">No servers added yet</p>
				<p class="mb-4 text-sm text-muted-foreground">Add your first server to start monitoring.</p>
				<Button onclick={() => { resetDialog(); dialogOpen = true; }}>
					<Plus class="size-4 mr-1.5" />
					Add Server
				</Button>
			</div>
		{/if}
	</div>

	{#if dialogOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="fixed inset-0 bg-black/50 backdrop-blur-sm" onclick={() => dialogOpen = false} onkeydown={() => {}}></div>
			<Card class="relative z-10 w-full max-w-md">
				{#if agentToken}
					<CardHeader>
						<CardTitle>Server Created</CardTitle>
						<CardDescription>Copy this token to configure your agent.</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
							<code class="flex-1 break-all font-mono text-xs">{agentToken}</code>
							<Button variant="ghost" size="icon" onclick={copyToken}>
								{#if copied}<Check class="size-4 text-primary" />{:else}<Copy class="size-4" />{/if}
							</Button>
						</div>
						<div class="rounded-lg bg-muted/50 p-3 font-mono text-xs space-y-1 text-muted-foreground">
							<p>AGENT_TOKEN={agentToken.slice(0, 8)}...</p>
							<p>AGENT_TYPE={formData.type}</p>
						</div>
					</CardContent>
					<CardFooter class="flex justify-between">
						<Button variant="outline" onclick={() => { resetDialog(); }}>
							Add Another
						</Button>
						<Button onclick={() => dialogOpen = false}>Done</Button>
					</CardFooter>
				{:else}
					<CardHeader>
						<CardTitle>Add Server</CardTitle>
						<CardDescription>Enter server details. An agent token will be generated.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onsubmit={handleSubmit} class="space-y-4">
							<div class="space-y-2">
								<Label for="hostname">Hostname</Label>
								<Input id="hostname" placeholder="web-server-01" bind:value={formData.hostname} />
							</div>
							<div class="space-y-2">
								<Label for="ip">IP Address</Label>
								<Input id="ip" placeholder="192.168.1.100" bind:value={formData.ip} />
							</div>
							<div class="space-y-2">
								<Label>Type</Label>
								<div class="flex gap-2">
									<Button variant={formData.type === "LOCAL" ? "default" : "outline"} size="sm" class="flex-1" onclick={() => formData.type = "LOCAL"} type="button">
										<HardDrive class="size-3.5 mr-1" /> Local
									</Button>
									<Button variant={formData.type === "CLOUD" ? "default" : "outline"} size="sm" class="flex-1" onclick={() => formData.type = "CLOUD"} type="button">
										<Globe class="size-3.5 mr-1" /> Cloud
									</Button>
								</div>
							</div>
							<div class="grid grid-cols-2 gap-3">
								<div class="space-y-2">
									<Label for="provider">Provider</Label>
									<Input id="provider" placeholder="DigitalOcean" bind:value={formData.provider} />
								</div>
								<div class="space-y-2">
									<Label for="location">Location</Label>
									<Input id="location" placeholder="Singapore" bind:value={formData.location} />
								</div>
							</div>
							{#if addError}
								<p class="text-xs text-destructive">{addError}</p>
							{/if}
							<div class="flex justify-end gap-2 pt-2">
								<Button variant="outline" onclick={() => dialogOpen = false} type="button">Cancel</Button>
								<Button type="submit" disabled={createMut.isPending}>
									{createMut.isPending ? "Creating..." : "Create Server"}
								</Button>
							</div>
						</form>
					</CardContent>
				{/if}
			</Card>
		</div>
	{/if}
{/if}
