<script lang="ts">
	import Button from "$lib/components/ui/button.svelte";
	import Badge from "$lib/components/ui/badge.svelte";
	import Card from "$lib/components/ui/card.svelte";
	import CardHeader from "$lib/components/ui/card-header.svelte";
	import CardTitle from "$lib/components/ui/card-title.svelte";
	import CardDescription from "$lib/components/ui/card-description.svelte";
	import CardContent from "$lib/components/ui/card-content.svelte";
	import { orpc } from "$lib/orpc";
	import { authClient } from "$lib/auth-client";
	import { goto } from "$app/navigation";
	import { createQuery } from "@tanstack/svelte-query";
	import {
		Activity,
		Server,
		ArrowRight,
		Cpu,
		HardDrive,
		Globe,
		Bell,
		ChevronRight,
		Check,
	} from "lucide-svelte";

	const healthCheck = createQuery(() => orpc.healthCheck.queryOptions());
	const sessionQuery = authClient.useSession();
</script>

<section class="relative overflow-hidden border-b border-border/40">
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
	<div class="container mx-auto max-w-6xl px-4 py-20 md:py-32 relative">
		<div class="mx-auto max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4 gap-1">
				<Activity class="size-3" />
				Infrastructure Monitoring
			</Badge>
			<h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
				Monitor Your Servers in
				<span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					Real-Time
				</span>
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				Agent-based monitoring platform for cloud and local infrastructure.
				Track CPU, RAM, disk, and network metrics with instant alerts.
			</p>
			<div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
				{#if $sessionQuery.data}
					<Button size="lg" onclick={() => goto("/dashboard")}>
						Go to Dashboard
						<ArrowRight class="ml-2 size-4" />
					</Button>
				{:else}
					<Button size="lg" onclick={() => goto("/login")}>
						Get Started
						<ArrowRight class="ml-2 size-4" />
					</Button>
					<Button variant="outline" size="lg" onclick={() => goto("/login")}>
						Sign In
					</Button>
				{/if}
			</div>

			<div class="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
				<div class="flex items-center gap-1.5">
					<div
						class={`size-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
					></div>
					{healthCheck.isLoading
						? "Checking API..."
						: healthCheck.data
							? "API Online"
							: "API Offline"}
				</div>
			</div>
		</div>
	</div>
</section>

<section class="container mx-auto max-w-6xl px-4 py-16 md:py-24">
	<div class="text-center mb-12">
		<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
			Everything You Need to Monitor
		</h2>
		<p class="mt-2 text-muted-foreground">
			Comprehensive metrics and alerts for your infrastructure
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<Card class="border-border/40">
			<CardHeader>
				<div class="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
					<Cpu class="size-5" />
				</div>
				<CardTitle class="text-base">CPU Monitoring</CardTitle>
				<CardDescription>
					Track CPU usage and load averages across all servers
				</CardDescription>
			</CardHeader>
		</Card>

		<Card class="border-border/40">
			<CardHeader>
				<div class="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
					<HardDrive class="size-5" />
				</div>
				<CardTitle class="text-base">RAM & Disk</CardTitle>
				<CardDescription>
					Monitor memory usage and storage consumption
				</CardDescription>
			</CardHeader>
		</Card>

		<Card class="border-border/40">
			<CardHeader>
				<div class="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
					<Globe class="size-5" />
				</div>
				<CardTitle class="text-base">Network</CardTitle>
				<CardDescription>
					Track bandwidth, packets, and network interfaces
				</CardDescription>
			</CardHeader>
		</Card>

		<Card class="border-border/40">
			<CardHeader>
				<div class="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
					<Bell class="size-5" />
				</div>
				<CardTitle class="text-base">Smart Alerts</CardTitle>
				<CardDescription>
					Configurable thresholds with instant notifications
				</CardDescription>
			</CardHeader>
		</Card>
	</div>
</section>

<section class="border-t border-border/40 bg-muted/30">
	<div class="container mx-auto max-w-6xl px-4 py-16 md:py-24">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<div>
				<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
					Local or Cloud. One Dashboard.
				</h2>
				<p class="mt-4 text-muted-foreground">
					Monitor both local VirtualBox VMs and remote VPS instances from a single interface.
					Each server gets its own real-time metrics, history charts, and alert configuration.
				</p>
				<div class="mt-6 space-y-3">
					<div class="flex items-start gap-3">
						<div class="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-0.5">
							<Check class="size-3" />
						</div>
						<div>
							<p class="text-sm font-medium">Auto-discovery</p>
							<p class="text-xs text-muted-foreground">Agent auto-registers on first connection</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-0.5">
							<Check class="size-3" />
						</div>
						<div>
							<p class="text-sm font-medium">Real-time WebSocket</p>
							<p class="text-xs text-muted-foreground">Live metric updates every 5 seconds</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-0.5">
							<Check class="size-3" />
						</div>
						<div>
							<p class="text-sm font-medium">Historical Data</p>
							<p class="text-xs text-muted-foreground">Query and visualize 24h of metric history</p>
						</div>
					</div>
				</div>
			</div>

			<div class="relative">
				<div class="rounded-lg border border-border/40 bg-card p-6 shadow-sm">
					<div class="flex items-center gap-2 mb-4">
						<div class="flex size-6 items-center justify-center rounded bg-primary/10">
							<Server class="size-3 text-primary" />
						</div>
						<span class="text-sm font-medium">Servers</span>
					</div>
					<div class="space-y-3">
						<div class="flex items-center justify-between rounded-md border border-border/40 p-3">
							<div>
								<p class="text-sm font-medium">Web Production</p>
								<p class="text-xs text-muted-foreground">103.xxx.xxx.xxx</p>
							</div>
							<div class="flex items-center gap-2">
								<Badge variant="default" class="text-[10px] px-1.5">CLOUD</Badge>
								<div class="size-2 rounded-full bg-green-500"></div>
							</div>
						</div>
						<div class="flex items-center justify-between rounded-md border border-border/40 p-3">
							<div>
								<p class="text-sm font-medium">Lab Ubuntu</p>
								<p class="text-xs text-muted-foreground">192.168.56.101</p>
							</div>
							<div class="flex items-center gap-2">
								<Badge variant="secondary" class="text-[10px] px-1.5">LOCAL</Badge>
								<div class="size-2 rounded-full bg-green-500"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="border-t border-border/40">
	<div class="container mx-auto max-w-6xl px-4 py-16 md:py-24 text-center">
		<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
			Ready to Monitor Your Infrastructure?
		</h2>
		<p class="mt-2 text-muted-foreground">
			Set up in minutes. Free and open source.
		</p>
		<div class="mt-6">
			{#if $sessionQuery.data}
				<Button size="lg" onclick={() => goto("/dashboard")}>
					View Dashboard
					<ChevronRight class="ml-1 size-4" />
				</Button>
			{:else}
				<Button size="lg" onclick={() => goto("/login")}>
					Get Started Free
					<ChevronRight class="ml-1 size-4" />
				</Button>
			{/if}
		</div>
	</div>
</section>
