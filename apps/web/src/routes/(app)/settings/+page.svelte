<script lang="ts">
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import { orpc } from "$lib/orpc";
	import { createQuery, createMutation } from "@tanstack/svelte-query";
	import Button from "$lib/components/ui/button.svelte";
	import Input from "$lib/components/ui/input.svelte";
	import Label from "$lib/components/ui/label.svelte";
	import Card from "$lib/components/ui/card.svelte";
	import CardHeader from "$lib/components/ui/card-header.svelte";
	import CardTitle from "$lib/components/ui/card-title.svelte";
	import CardDescription from "$lib/components/ui/card-description.svelte";
	import CardContent from "$lib/components/ui/card-content.svelte";
	import { Copy, Check } from "lucide-svelte";

	const sessionQuery = authClient.useSession();
	const serverList = createQuery(() => orpc.monitoring.serverList.queryOptions());
	let selectedServerId = $state("");
	let cpuThreshold = $state("80");
	let ramThreshold = $state("85");
	let diskThreshold = $state("90");
	let enabled = $state(true);
	let savedMessage = $state("");

	$effect(() => {
		if (!$sessionQuery.isPending && !$sessionQuery.data) {
			goto("/login");
		}
	});

	$effect(() => {
		if (selectedServerId) {
			orpc.monitoring.alertConfigGet.call({ serverId: selectedServerId }).then((data) => {
				cpuThreshold = String(data.cpuThreshold);
				ramThreshold = String(data.ramThreshold);
				diskThreshold = String(data.diskThreshold);
				enabled = data.enabled;
			});
		}
	});

	const saveMutation = createMutation(() => ({
		mutationFn: async () => {
			await orpc.monitoring.alertConfigUpdate.call({
				serverId: selectedServerId,
				cpuThreshold: Number(cpuThreshold),
				ramThreshold: Number(ramThreshold),
				diskThreshold: Number(diskThreshold),
				enabled,
			});
		},
		onSuccess: () => {
			savedMessage = "Saved";
			setTimeout(() => (savedMessage = ""), 2000);
		},
	}));

	let agentTokenServerId = $state("");
	let agentTokenValue = $state("");
	let tokenCopied = $state(false);

	const tokenMutation = createMutation(() => ({
		mutationFn: async () => {
			const result = await orpc.monitoring.serverRegenerateToken.call({ serverId: agentTokenServerId });
			return result;
		},
		onSuccess: (data) => {
			agentTokenValue = data.token;
		},
	}));

	async function copyToken() {
		await navigator.clipboard.writeText(agentTokenValue);
		tokenCopied = true;
		setTimeout(() => (tokenCopied = false), 2000);
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
		<div class="mb-6">
			<h1 class="text-2xl font-semibold">Settings</h1>
			<p class="text-sm text-muted-foreground">
				Alert thresholds and server configuration
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Alert Thresholds</CardTitle>
					<CardDescription>
						Configure per-server CPU, RAM, and disk alert thresholds.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="alert-server">Server</Label>
							<select
								id="alert-server"
								bind:value={selectedServerId}
								class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
							>
								<option value="">Select a server</option>
								{#each serverList.data ?? [] as server (server.id)}
									<option value={server.id}>{server.hostname}</option>
								{/each}
							</select>
						</div>

						{#if selectedServerId}
							<div class="space-y-3 pt-2">
								<div class="space-y-1.5">
									<Label for="cpu-threshold">CPU Threshold (%)</Label>
									<Input id="cpu-threshold" type="number" min="0" max="100" bind:value={cpuThreshold} />
								</div>
								<div class="space-y-1.5">
									<Label for="ram-threshold">RAM Threshold (%)</Label>
									<Input id="ram-threshold" type="number" min="0" max="100" bind:value={ramThreshold} />
								</div>
								<div class="space-y-1.5">
									<Label for="disk-threshold">Disk Threshold (%)</Label>
									<Input id="disk-threshold" type="number" min="0" max="100" bind:value={diskThreshold} />
								</div>
								<div class="flex items-center gap-2 pt-1">
									<input id="alerts-enabled" type="checkbox" bind:checked={enabled}
										class="size-4 rounded border-input" />
									<Label for="alerts-enabled">Enable alerts</Label>
								</div>
								<div class="flex items-center gap-2 pt-2">
									<Button onclick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
										{saveMutation.isPending ? "Saving..." : "Save"}
									</Button>
									{#if savedMessage}
										<span class="text-xs text-emerald-400">{savedMessage}</span>
									{/if}
								</div>
							</div>
						{:else}
							<div class="flex items-center justify-center py-6">
								<p class="text-sm text-muted-foreground">Select a server to configure alerts.</p>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Agent Tokens</CardTitle>
					<CardDescription>
						Regenerate and copy agent tokens for your servers.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="token-server">Server</Label>
							<select
								id="token-server"
								bind:value={agentTokenServerId}
								class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
							>
								<option value="">Select a server</option>
								{#each serverList.data ?? [] as server (server.id)}
									<option value={server.id}>{server.hostname}</option>
								{/each}
							</select>
						</div>
						{#if agentTokenServerId}
							<Button variant="outline" onclick={() => tokenMutation.mutate()} disabled={tokenMutation.isPending} class="w-full">
								{tokenMutation.isPending ? "Generating..." : "Regenerate Token"}
							</Button>
							{#if agentTokenValue}
								<div class="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
									<code class="flex-1 break-all font-mono text-xs">{agentTokenValue}</code>
									<Button variant="ghost" size="icon" onclick={copyToken}>
										{#if tokenCopied}<Check class="size-4 text-emerald-400" />{:else}<Copy class="size-4" />{/if}
									</Button>
								</div>
							{/if}
						{/if}
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
{/if}
