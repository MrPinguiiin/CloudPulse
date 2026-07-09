<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { orpc } from '$lib/orpc';
	import { useLiveMetrics } from '$lib/metrics-store.svelte';
	import { createQuery, createMutation } from '@tanstack/svelte-query';
	import ServersHeader from '$lib/components/ServersHeader.svelte';
	import ServerCardView from '$lib/components/ServerCardView.svelte';
	import ServerListView from '$lib/components/ServerListView.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardFooter from '$lib/components/ui/card-footer.svelte';
	import { Plus, Copy, Check, Globe, HardDrive } from 'lucide-svelte';

	const sessionQuery = authClient.useSession();
	const serverList = createQuery(() => orpc.monitoring.serverList.queryOptions());
	const live = useLiveMetrics();

	$effect(() => {
		if (!$sessionQuery.isPending && !$sessionQuery.data) {
			goto('/login');
		}
	});

	let view = $state<'grid' | 'list'>('grid');

	function formatBytes(bytes: number | bigint): string {
		const n = Number(bytes);
		if (n >= 1e12) return (n / 1e12).toFixed(1) + ' TB';
		if (n >= 1e9) return (n / 1e9).toFixed(1) + ' GB';
		if (n >= 1e6) return (n / 1e6).toFixed(1) + ' MB';
		if (n >= 1e3) return (n / 1e3).toFixed(1) + ' KB';
		return n + ' B';
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

	// --- Add Server ---
	let addDialogOpen = $state(false);
	let addFormData = $state({ hostname: "", ip: "", type: "LOCAL" as "LOCAL" | "CLOUD", provider: "", location: "" });
	let addToken = $state("");
	let addCopied = $state(false);
	let addError = $state("");

	const createMut = createMutation(() => ({
		mutationFn: async () => {
			const result = await orpc.monitoring.serverCreate.call({
				hostname: addFormData.hostname,
				ip: addFormData.ip,
				type: addFormData.type,
				provider: addFormData.provider || undefined,
				location: addFormData.location || undefined,
			});
			return result;
		},
		onSuccess: (data) => {
			addToken = data.agentToken;
			addError = "";
			serverList.refetch();
		},
		onError: (err) => {
			addError = err.message || "Failed to create server";
		},
	}));

	function handleAddSubmit(e: Event) {
		e.preventDefault();
		createMut.mutate();
	}

	async function copyAddToken() {
		await navigator.clipboard.writeText(addToken);
		addCopied = true;
		setTimeout(() => (addCopied = false), 2000);
	}

	function resetAddDialog() {
		addFormData = { hostname: "", ip: "", type: "LOCAL", provider: "", location: "" };
		addToken = "";
		addError = "";
	}

	// --- Edit Server ---
	let editDialogOpen = $state(false);
	let editServerId = $state("");
	let editFormData = $state({ hostname: "", ip: "", type: "LOCAL" as "LOCAL" | "CLOUD", provider: "", location: "" });
	let editToken = $state("");
	let editCopied = $state(false);
	let editError = $state("");

	function openEdit(id: string) {
		const server = serverList.data?.find((s: { id: string }) => s.id === id);
		if (!server) return;
		editServerId = id;
		editFormData = {
			hostname: server.hostname,
			ip: server.ip,
			type: server.type as "LOCAL" | "CLOUD",
			provider: server.provider ?? "",
			location: server.location ?? "",
		};
		editToken = "";
		editError = "";
		editDialogOpen = true;
	}

	const updateMut = createMutation(() => ({
		mutationFn: async () => {
			const updated = await orpc.monitoring.serverUpdate.call({
				serverId: editServerId,
				hostname: editFormData.hostname,
				ip: editFormData.ip,
				type: editFormData.type,
				provider: editFormData.provider || undefined,
				location: editFormData.location || undefined,
			});
			return updated;
		},
		onSuccess: async () => {
			try {
				const { token } = await orpc.monitoring.serverRegenerateToken.call({ serverId: editServerId });
				editToken = token;
			} catch {
				editToken = "Token regeneration failed";
			}
			editError = "";
			serverList.refetch();
		},
		onError: (err) => {
			editError = err.message || "Failed to update server";
		},
	}));

	function handleEditSubmit(e: Event) {
		e.preventDefault();
		updateMut.mutate();
	}

	async function copyEditToken() {
		await navigator.clipboard.writeText(editToken);
		editCopied = true;
		setTimeout(() => (editCopied = false), 2000);
	}

	function closeEdit() {
		editDialogOpen = false;
		editServerId = "";
	}

	// --- Delete Server ---
	let deleteDialogOpen = $state(false);
	let deleteServerId = $state("");
	let deleteServerName = $state("");
	let deleteError = $state("");

	function openDelete(id: string) {
		const server = serverList.data?.find((s: { id: string; hostname: string }) => s.id === id);
		if (!server) return;
		deleteServerId = id;
		deleteServerName = server.hostname;
		deleteError = "";
		deleteDialogOpen = true;
	}

	const deleteMut = createMutation(() => ({
		mutationFn: async () => {
			await orpc.monitoring.serverDelete.call({ serverId: deleteServerId });
		},
		onSuccess: () => {
			deleteDialogOpen = false;
			serverList.refetch();
		},
		onError: (err) => {
			deleteError = err.message || "Failed to delete server";
		},
	}));

	function confirmDelete() {
		deleteMut.mutate();
	}

	// --- Transform server data for display ---
	type DisplayServer = {
		id: string;
		name: string;
		ip: string;
		status: string;
		location: string;
		cpu: number | null;
		ram: number | null;
		disk: number | null;
		network: string | null;
		uptime: string | null;
	};

	const displayServers = $derived<DisplayServer[]>(
		(serverList.data ?? []).map((s: { id: string; hostname: string; ip: string; status: string; type: string; metrics: Array<{ cpuUsage: number; ramUsagePct: number; diskUsagePct: number; networkRx: number | bigint; networkTx: number | bigint; uptime: number | bigint }> | undefined }) => {
			const liveMetric = live.getMetric(s.id);
			const liveStatus = live.getStatus(s.id);
			const dbMetric = s.metrics?.[0];
			const m = liveMetric ?? (dbMetric ? {
				cpuUsage: dbMetric.cpuUsage,
				ramUsagePct: dbMetric.ramUsagePct,
				diskUsagePct: dbMetric.diskUsagePct,
				networkRx: Number(dbMetric.networkRx),
				networkTx: Number(dbMetric.networkTx),
				uptime: Number(dbMetric.uptime),
			} : null);

			return {
				id: s.id,
				name: s.hostname,
				ip: s.ip,
				status: liveStatus ?? s.status,
				location: s.type,
				cpu: m?.cpuUsage ?? null,
				ram: m?.ramUsagePct ?? null,
				disk: m?.diskUsagePct ?? null,
				network: m ? `${formatBytes(m.networkRx)} / ${formatBytes(m.networkTx)}` : null,
				uptime: m ? formatUptime(m.uptime) : null,
			};
		})
	);
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
	<ServersHeader serverCount={displayServers.length} bind:view onadd={() => { resetAddDialog(); addDialogOpen = true; }} />

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{#if displayServers.length === 0}
			<EmptyState onadd={() => { resetAddDialog(); addDialogOpen = true; }} />
		{:else if view === 'grid'}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each displayServers as server (server.id)}
					<ServerCardView
						id={server.id}
						name={server.name}
						ip={server.ip}
						status={server.status}
						location={server.location}
						cpu={server.cpu}
						ram={server.ram}
						disk={server.disk}
						network={server.network}
						uptime={server.uptime}
						onclick={(id) => goto(`/servers/${id}`)}
						onedit={() => openEdit(server.id)}
						ondelete={() => openDelete(server.id)}
					/>
				{/each}
			</div>
		{:else}
			<ServerListView servers={displayServers} onclick={(id) => goto(`/servers/${id}`)} onedit={openEdit} ondelete={openDelete} />
		{/if}
	</main>

	<!-- Add Server Dialog -->
	{#if addDialogOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="fixed inset-0 bg-black/50 backdrop-blur-sm" onclick={() => addDialogOpen = false} onkeydown={() => {}}></div>
			<Card class="relative z-10 w-full max-w-md">
				{#if addToken}
					<CardHeader>
						<CardTitle>Server Created</CardTitle>
						<CardDescription>Copy this token to configure your agent.</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
							<code class="flex-1 break-all font-mono text-xs">{addToken}</code>
							<Button variant="ghost" size="icon" onclick={copyAddToken}>
								{#if addCopied}<Check class="size-4 text-primary" />{:else}<Copy class="size-4" />{/if}
							</Button>
						</div>
						<div class="rounded-lg bg-muted/50 p-3 font-mono text-xs space-y-1 text-muted-foreground">
							<p>AGENT_TOKEN={addToken.slice(0, 8)}...</p>
							<p>AGENT_TYPE={addFormData.type}</p>
						</div>
					</CardContent>
					<CardFooter class="flex justify-between">
						<Button variant="outline" onclick={() => { resetAddDialog(); }}>
							Add Another
						</Button>
						<Button onclick={() => addDialogOpen = false}>Done</Button>
					</CardFooter>
				{:else}
					<CardHeader>
						<CardTitle>Add Server</CardTitle>
						<CardDescription>Enter server details. An agent token will be generated.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onsubmit={handleAddSubmit} class="space-y-4">
							<div class="space-y-2">
								<Label for="add-hostname">Hostname</Label>
								<Input id="add-hostname" placeholder="web-server-01" bind:value={addFormData.hostname} />
							</div>
							<div class="space-y-2">
								<Label for="add-ip">IP Address</Label>
								<Input id="add-ip" placeholder="192.168.1.100" bind:value={addFormData.ip} />
							</div>
							<div class="space-y-2">
								<Label>Type</Label>
								<div class="flex gap-2">
									<Button variant={addFormData.type === "LOCAL" ? "default" : "outline"} size="sm" class="flex-1" onclick={() => addFormData.type = "LOCAL"} type="button">
										<HardDrive class="size-3.5 mr-1" /> Local
									</Button>
									<Button variant={addFormData.type === "CLOUD" ? "default" : "outline"} size="sm" class="flex-1" onclick={() => addFormData.type = "CLOUD"} type="button">
										<Globe class="size-3.5 mr-1" /> Cloud
									</Button>
								</div>
							</div>
							<div class="grid grid-cols-2 gap-3">
								<div class="space-y-2">
									<Label for="add-provider">Provider</Label>
									<Input id="add-provider" placeholder="DigitalOcean" bind:value={addFormData.provider} />
								</div>
								<div class="space-y-2">
									<Label for="add-location">Location</Label>
									<Input id="add-location" placeholder="Singapore" bind:value={addFormData.location} />
								</div>
							</div>
							{#if addError}
								<p class="text-xs text-destructive">{addError}</p>
							{/if}
							<div class="flex justify-end gap-2 pt-2">
								<Button variant="outline" onclick={() => addDialogOpen = false} type="button">Cancel</Button>
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

	<!-- Edit Server Dialog -->
	{#if editDialogOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="fixed inset-0 bg-black/50 backdrop-blur-sm" onclick={closeEdit} onkeydown={() => {}}></div>
			<Card class="relative z-10 w-full max-w-md">
				{#if editToken}
					<CardHeader>
						<CardTitle>Server Updated</CardTitle>
						<CardDescription>The agent token has been regenerated. Copy it now.</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
							<code class="flex-1 break-all font-mono text-xs">{editToken}</code>
							<Button variant="ghost" size="icon" onclick={copyEditToken}>
								{#if editCopied}<Check class="size-4 text-primary" />{:else}<Copy class="size-4" />{/if}
							</Button>
						</div>
						<div class="rounded-lg bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
							<p>AGENT_TOKEN={editToken.slice(0, 8)}...</p>
						</div>
					</CardContent>
					<CardFooter class="flex justify-end">
						<Button onclick={closeEdit}>Done</Button>
					</CardFooter>
				{:else}
					<CardHeader>
						<CardTitle>Edit Server</CardTitle>
						<CardDescription>Update server details. The agent token will be regenerated.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onsubmit={handleEditSubmit} class="space-y-4">
							<div class="space-y-2">
								<Label for="edit-hostname">Hostname</Label>
								<Input id="edit-hostname" bind:value={editFormData.hostname} />
							</div>
							<div class="space-y-2">
								<Label for="edit-ip">IP Address</Label>
								<Input id="edit-ip" bind:value={editFormData.ip} />
							</div>
							<div class="space-y-2">
								<Label>Type</Label>
								<div class="flex gap-2">
									<Button variant={editFormData.type === "LOCAL" ? "default" : "outline"} size="sm" class="flex-1" onclick={() => editFormData.type = "LOCAL"} type="button">
										<HardDrive class="size-3.5 mr-1" /> Local
									</Button>
									<Button variant={editFormData.type === "CLOUD" ? "default" : "outline"} size="sm" class="flex-1" onclick={() => editFormData.type = "CLOUD"} type="button">
										<Globe class="size-3.5 mr-1" /> Cloud
									</Button>
								</div>
							</div>
							<div class="grid grid-cols-2 gap-3">
								<div class="space-y-2">
									<Label for="edit-provider">Provider</Label>
									<Input id="edit-provider" bind:value={editFormData.provider} />
								</div>
								<div class="space-y-2">
									<Label for="edit-location">Location</Label>
									<Input id="edit-location" bind:value={editFormData.location} />
								</div>
							</div>
							{#if editError}
								<p class="text-xs text-destructive">{editError}</p>
							{/if}
							<div class="flex justify-end gap-2 pt-2">
								<Button variant="outline" onclick={closeEdit} type="button">Cancel</Button>
								<Button type="submit" disabled={updateMut.isPending}>
									{updateMut.isPending ? "Updating..." : "Save & Regenerate Token"}
								</Button>
							</div>
						</form>
					</CardContent>
				{/if}
			</Card>
		</div>
	{/if}

	<!-- Delete Server Dialog -->
	{#if deleteDialogOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="fixed inset-0 bg-black/50 backdrop-blur-sm" onclick={() => deleteDialogOpen = false} onkeydown={() => {}}></div>
			<Card class="relative z-10 w-full max-w-sm">
				<CardHeader>
					<CardTitle>Delete Server</CardTitle>
					<CardDescription>
						Are you sure you want to delete <strong>{deleteServerName}</strong>? This action cannot be undone. All metrics and alerts for this server will be permanently removed.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{#if deleteError}
						<p class="text-xs text-destructive mb-3">{deleteError}</p>
					{/if}
					<div class="flex justify-end gap-2">
						<Button variant="outline" onclick={() => deleteDialogOpen = false}>Cancel</Button>
						<Button variant="destructive" onclick={confirmDelete} disabled={deleteMut.isPending}>
							{deleteMut.isPending ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}
{/if}
