<script lang="ts">
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import { orpc } from "$lib/orpc";
	import { createQuery, createMutation } from "@tanstack/svelte-query";
	import Button from "$lib/components/ui/button.svelte";
	import Input from "$lib/components/ui/input.svelte";
	import Label from "$lib/components/ui/label.svelte";
	import SelectRoot from "$lib/components/ui/select/select.svelte";
	import SelectTrigger from "$lib/components/ui/select/select-trigger.svelte";
	import SelectValue from "$lib/components/ui/select/select-value.svelte";
	import SelectContent from "$lib/components/ui/select/select-content.svelte";
	import SelectItem from "$lib/components/ui/select/select-item.svelte";
	import { Copy, Check, Settings, Key, Server as ServerIcon } from "lucide-svelte";

	const sessionQuery = authClient.useSession();
	const serverList = createQuery(() => orpc.monitoring.serverList.queryOptions());
	const servers = $derived(serverList.data ?? []);
	const hasServers = $derived(servers.length > 0);
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

	let alertLoadError = $state("");

	$effect(() => {
		if (selectedServerId) {
			alertLoadError = "";
			orpc.monitoring.alertConfigGet.call({ serverId: selectedServerId }).then((data) => {
				cpuThreshold = String(data.cpuThreshold);
				ramThreshold = String(data.ramThreshold);
				diskThreshold = String(data.diskThreshold);
				enabled = data.enabled;
			}).catch((err) => {
				alertLoadError = err.message || "Failed to load alert config";
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

			{#if serverList.isError}
				<div class="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
					<p class="text-sm text-destructive">Failed to load servers. Please check your connection.</p>
					<pre class="mt-2 text-xs text-muted-foreground/60">{(serverList.error as Error)?.message ?? "Unknown error"}</pre>
				</div>
			{/if}

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div class="bg-card rounded-2xl border border-border shadow-sm">
					<div class="p-6 border-b border-border flex items-center gap-2">
						<Settings class="w-5 h-5 text-muted-foreground" />
						<h3 class="text-lg font-semibold text-foreground">Alert Thresholds</h3>
					</div>
					<div class="p-6">
						{#if !hasServers && !serverList.isPending}
							<div class="flex flex-col items-center justify-center py-8 text-center">
								<div class="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
									<ServerIcon class="size-5 text-muted-foreground" />
								</div>
								<p class="text-sm font-medium text-foreground mb-1">No servers yet</p>
								<p class="text-xs text-muted-foreground mb-4">Add a server first to configure alerts.</p>
								<Button size="sm" onclick={() => goto("/dashboard")}>
									Add Server
								</Button>
							</div>
						{:else if serverList.isPending}
							<div class="flex items-center justify-center py-8">
								<p class="text-xs text-muted-foreground">Loading servers...</p>
							</div>
						{:else}
							<div class="space-y-4">
								<div class="space-y-2">
									<Label for="alert-server">Server</Label>
									<SelectRoot type="single" bind:value={selectedServerId}>
										<SelectTrigger id="alert-server" class="w-full">
											<SelectValue placeholder="Select a server" />
										</SelectTrigger>
										<SelectContent>
											{#each servers as server (server.id)}
												<SelectItem value={server.id}>{server.hostname}</SelectItem>
											{/each}
										</SelectContent>
									</SelectRoot>
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
										{#if alertLoadError}
											<p class="text-xs text-destructive">{alertLoadError}</p>
										{/if}
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
						{/if}
					</div>
				</div>

				<div class="bg-card rounded-2xl border border-border shadow-sm">
					<div class="p-6 border-b border-border flex items-center gap-2">
						<Key class="w-5 h-5 text-muted-foreground" />
						<h3 class="text-lg font-semibold text-foreground">Agent Tokens</h3>
					</div>
					<div class="p-6">
						{#if !hasServers && !serverList.isPending}
							<div class="flex flex-col items-center justify-center py-8 text-center">
								<div class="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
									<ServerIcon class="size-5 text-muted-foreground" />
								</div>
								<p class="text-sm font-medium text-foreground mb-1">No servers yet</p>
								<p class="text-xs text-muted-foreground mb-4">Add a server first to manage agent tokens.</p>
								<Button size="sm" onclick={() => goto("/dashboard")}>
									Add Server
								</Button>
							</div>
						{:else if serverList.isPending}
							<div class="flex items-center justify-center py-8">
								<p class="text-xs text-muted-foreground">Loading servers...</p>
							</div>
						{:else}
							<div class="space-y-4">
								<div class="space-y-2">
									<Label for="token-server">Server</Label>
									<SelectRoot type="single" bind:value={agentTokenServerId}>
										<SelectTrigger id="token-server" class="w-full">
											<SelectValue placeholder="Select a server" />
										</SelectTrigger>
										<SelectContent>
											{#each servers as server (server.id)}
												<SelectItem value={server.id}>{server.hostname}</SelectItem>
											{/each}
										</SelectContent>
									</SelectRoot>
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
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
