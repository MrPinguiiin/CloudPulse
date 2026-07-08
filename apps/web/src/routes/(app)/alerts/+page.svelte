<script lang="ts">
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import { orpc } from "$lib/orpc";
	import { createQuery } from "@tanstack/svelte-query";
	import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-svelte";
	import Badge from "$lib/components/ui/badge.svelte";

	const sessionQuery = authClient.useSession();
	const alertsQuery = createQuery(() =>
		orpc.monitoring.alertList.queryOptions(),
	);

	$effect(() => {
		if (!$sessionQuery.isPending && !$sessionQuery.data) {
			goto("/login");
		}
	});

	function severityColor(severity: string): string {
		if (severity === "CRITICAL") return "text-red-400";
		if (severity === "WARNING") return "text-amber-400";
		return "text-blue-400";
	}

	function severityBg(severity: string): string {
		if (severity === "CRITICAL") return "bg-red-500/10";
		if (severity === "WARNING") return "bg-amber-500/10";
		return "bg-blue-500/10";
	}
</script>

{#if $sessionQuery.isPending || alertsQuery.isLoading}
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
			<h1 class="text-2xl font-semibold">Alerts</h1>
			<p class="text-sm text-muted-foreground">
				{alertsQuery.data?.length ?? 0} alerts
			</p>
		</div>

		{#if alertsQuery.data && alertsQuery.data.length > 0}
			<div class="space-y-2">
				{#each alertsQuery.data as alert (alert.id)}
					<div class="flex items-start gap-4 rounded-lg border border-border/40 bg-card/50 p-4">
						<div class="flex size-9 shrink-0 items-center justify-center rounded-lg {severityBg(alert.severity)}">
							{#if alert.severity === "CRITICAL"}
								<AlertTriangle class="size-4 text-red-400" />
							{:else if alert.severity === "WARNING"}
								<Bell class="size-4 text-amber-400" />
							{:else}
								<Info class="size-4 text-blue-400" />
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<Badge
									variant={alert.severity === "CRITICAL" ? "destructive" : alert.severity === "WARNING" ? "secondary" : "outline"}
								>
									{alert.severity}
								</Badge>
								<span class="font-mono text-xs text-muted-foreground">
									{alert.server?.hostname ?? "Unknown"}
								</span>
							</div>
							<p class="text-sm">{alert.message}</p>
							<div class="mt-1 flex gap-4 text-xs text-muted-foreground/60">
								<span>Threshold: {alert.threshold}%</span>
								<span>Current: {alert.currentValue.toFixed(1)}%</span>
								<span>{new Date(alert.createdAt).toLocaleString()}</span>
								{#if alert.resolvedAt}
									<span class="text-emerald-400">Resolved</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
					<CheckCircle class="size-6 text-muted-foreground" />
				</div>
				<p class="font-medium">No alerts</p>
				<p class="text-sm text-muted-foreground">All systems operational.</p>
			</div>
		{/if}
	</div>
{/if}
