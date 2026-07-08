<script lang="ts">
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import { orpc } from "$lib/orpc";
	import { createQuery, createMutation } from "@tanstack/svelte-query";
	import Button from "$lib/components/ui/button.svelte";
	import Input from "$lib/components/ui/input.svelte";
	import Label from "$lib/components/ui/label.svelte";
	import { Copy, Check, Settings, Key } from "lucide-svelte";

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
	<div class="min-h-full bg-gradient-to-br from-background to-muted/30 p-8">
		<div class="mx-auto max-w-7xl">
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-foreground mb-2">Settings</h1>
				<p class="text-sm text-muted-foreground">Alert thresholds and server configuration</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div class="bg-card rounded-2xl border border-border shadow-sm">
					<div class="p-6 border-b border-border flex items-center gap-2">
						<Settings class="w-5 h-5 text-muted-foreground" />
						<h3 class="text-lg font-semibold text-foreground">Alert Thresholds</h3>
					</div>
					<div class="p-6">
						<div class="space-y-4">
							<div class="space-y-2">
								<Label for="alert-server">Server</Label>
								<select
									id="alert-server"
									bind:value={selectedServerId}
									class="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
								>
									<option value="">Select a server</option>
									{#each serverList.data ?? [] as server (server.id)}
										<option value={server.id}>{server.hostname}</option>
									{/each}
								</select>
							</div>

							{#if selectedServerId}
								<div class="space-y-3 pt-2">
									<div class="grid grid-cols-3 gap-3">
										<div class="space-y-1.5">
											<Label for="cpu-threshold">CPU %</Label>
											<Input id="cpu-threshold" type="number" min="0" max="100" bind:value={cpuThreshold} />
										</div>
										<div class="space-y-1.5">
											<Label for="ram-threshold">RAM %</Label>
											<Input id="ram-threshold" type="number" min="0" max="100" bind:value={ramThreshold} />
										</div>
										<div class="space-y-1.5">
											<Label for="disk-threshold">Disk %</Label>
											<Input id="disk-threshold" type="number" min="0" max="100" bind:value={diskThreshold} />
										</div>
									</div>
									<div class="flex items-center gap-2 pt-1">
										<input id="alerts-enabled" type="checkbox" bind:checked={enabled}
											class="size-4 rounded border-input accent-primary" />
										<Label for="alerts-enabled">Enable alerts</Label>
									</div>
									<div class="flex items-center gap-2 pt-2">
										<Button onclick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
											{saveMutation.isPending ? "Saving..." : "Save"}
										</Button>
										{#if savedMessage}
											<span class="text-xs text-primary">{savedMessage}</span>
										{/if}
									</div>
								</div>
							{:else}
								<div class="flex items-center justify-center py-8">
									<p class="text-sm text-muted-foreground">Select a server to configure alerts.</p>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="bg-card rounded-2xl border border-border shadow-sm">
					<div class="p-6 border-b border-border flex items-center gap-2">
						<Key class="w-5 h-5 text-muted-foreground" />
						<h3 class="text-lg font-semibold text-foreground">Agent Tokens</h3>
					</div>
					<div class="p-6">
						<div class="space-y-4">
							<div class="space-y-2">
								<Label for="token-server">Server</Label>
								<select
									id="token-server"
									bind:value={agentTokenServerId}
									class="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
								>
									<option value="">Select a server</option>
									{#each serverList.data ?? [] as server (server.id)}
										<option value={server.id}>{server.hostname}</option>
									{/each}
								</select>
							</div>
							{#if agentTokenServerId}
								<Button variant="outline" onclick={() => tokenMutation.mutate()} disabled={tokenMutation.isPending} class="w-full rounded-lg">
									{tokenMutation.isPending ? "Generating..." : "Regenerate Token"}
								</Button>
								{#if agentTokenValue}
									<div class="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
										<code class="flex-1 break-all font-mono text-xs">{agentTokenValue}</code>
										<Button variant="ghost" size="icon" onclick={copyToken}>
											{#if tokenCopied}<Check class="size-4 text-primary" />{:else}<Copy class="size-4" />{/if}
										</Button>
									</div>
								{/if}
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
