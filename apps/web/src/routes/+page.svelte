<script lang="ts">
	import Button from "$lib/components/ui/button.svelte";
	import Badge from "$lib/components/ui/badge.svelte";
	import Card from "$lib/components/ui/card.svelte";
	import CardHeader from "$lib/components/ui/card-header.svelte";
	import CardTitle from "$lib/components/ui/card-title.svelte";
	import CardDescription from "$lib/components/ui/card-description.svelte";
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
		Terminal,
		Zap,
		TrendingUp,
		Database,
		Network,
	} from "lucide-svelte";

	const healthCheck = createQuery(() => orpc.healthCheck.queryOptions());
	const sessionQuery = authClient.useSession();
</script>

<!-- Hero -->
<section class="relative overflow-hidden border-b border-border/40">
	<div class="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-emerald-500/[0.04]"></div>
	<div class="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/4 rounded-full bg-indigo-500/[0.06] blur-3xl"></div>
	<div class="absolute left-0 bottom-0 h-80 w-80 -translate-x-1/3 translate-y-1/4 rounded-full bg-emerald-500/[0.04] blur-3xl"></div>

	<div class="container mx-auto max-w-6xl px-4 py-24 md:py-36 relative">
		<div class="mx-auto max-w-3xl text-center">
			<div class="mb-6 inline-flex items-center rounded-full border border-border/60 bg-card/80 px-4 py-1.5 text-xs backdrop-blur-sm">
				<div class="mr-2 flex size-5 items-center justify-center rounded-full bg-emerald-500/20">
					<div class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
				</div>
				<span class="text-muted-foreground">
					API Status:
					<span class="font-medium text-emerald-400 ml-1">
						{healthCheck.isLoading ? "Checking..." : healthCheck.data ? "Online" : "Offline"}
					</span>
				</span>
			</div>

			<h1 class="font-heading font-mono text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
				Monitor infrastructure
				<span class="mt-2 block bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
					in real time
				</span>
			</h1>

			<p class="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
				Agent-based monitoring for cloud and local servers.
				Track CPU, RAM, disk, and network — with WebSocket live updates every 5 seconds.
			</p>

			<div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
				{#if $sessionQuery.data}
					<Button size="lg" class="bg-indigo-600 hover:bg-indigo-500" onclick={() => goto("/dashboard")}>
						Open Dashboard
						<ArrowRight class="ml-2 size-4" />
					</Button>
				{:else}
					<Button size="lg" class="bg-indigo-600 hover:bg-indigo-500" onclick={() => goto("/login")}>
						Get Started
						<ArrowRight class="ml-2 size-4" />
					</Button>
					<Button variant="outline" size="lg" onclick={() => goto("/login")}>
						Sign In
					</Button>
				{/if}
			</div>

			<p class="mt-4 font-mono text-xs text-muted-foreground/60">
				No credit card required &middot; Open source &middot; MIT License
			</p>
		</div>
	</div>
</section>

<!-- Metrics Banner -->
<section class="border-b border-border/40 bg-card/30">
	<div class="container mx-auto max-w-6xl px-4 py-8">
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
			<div class="text-center">
				<div class="font-mono text-2xl font-semibold tabular-nums text-indigo-400">&lt;5s</div>
				<div class="mt-1 text-xs text-muted-foreground">Polling Interval</div>
			</div>
			<div class="text-center">
				<div class="font-mono text-2xl font-semibold tabular-nums text-emerald-400">99.9%</div>
				<div class="mt-1 text-xs text-muted-foreground">Uptime SLA</div>
			</div>
			<div class="text-center">
				<div class="font-mono text-2xl font-semibold tabular-nums text-violet-400">WebSocket</div>
				<div class="mt-1 text-xs text-muted-foreground">Real-Time Transport</div>
			</div>
			<div class="text-center">
				<div class="font-mono text-2xl font-semibold tabular-nums text-amber-400">24h</div>
				<div class="mt-1 text-xs text-muted-foreground">Data Retention</div>
			</div>
		</div>
	</div>
</section>

<!-- Features Grid -->
<section class="container mx-auto max-w-6xl px-4 py-20 md:py-28">
	<div class="mb-14 text-center">
		<p class="font-mono text-xs font-medium uppercase tracking-wider text-indigo-400">Features</p>
		<h2 class="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
			Everything you need to monitor
		</h2>
		<p class="mt-3 text-muted-foreground">
			Comprehensive metrics and intelligent alerts across your entire infrastructure
		</p>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<Card class="border-border/40 bg-card/50 backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:border-indigo-500/30 hover:bg-card/80">
			<CardHeader>
				<div class="mb-3 flex size-11 items-center justify-center rounded-lg bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
					<Cpu class="size-5 text-indigo-400" />
				</div>
				<CardTitle class="font-mono text-base">CPU Monitoring</CardTitle>
				<CardDescription>
					Real-time CPU usage per core, load averages (1m/5m/15m), and processor temperature. Detect spikes instantly.
				</CardDescription>
			</CardHeader>
		</Card>

		<Card class="border-border/40 bg-card/50 backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:border-blue-500/30 hover:bg-card/80">
			<CardHeader>
				<div class="mb-3 flex size-11 items-center justify-center rounded-lg bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
					<HardDrive class="size-5 text-blue-400" />
				</div>
				<CardTitle class="font-mono text-base">RAM &amp; Disk</CardTitle>
				<CardDescription>
					Track memory consumption, swap usage, disk I/O, and storage capacity across all mounted volumes.
				</CardDescription>
			</CardHeader>
		</Card>

		<Card class="border-border/40 bg-card/50 backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:border-violet-500/30 hover:bg-card/80">
			<CardHeader>
				<div class="mb-3 flex size-11 items-center justify-center rounded-lg bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
					<Network class="size-5 text-violet-400" />
				</div>
				<CardTitle class="font-mono text-base">Network Traffic</CardTitle>
				<CardDescription>
					Monitor RX/TX bytes per second, total bandwidth usage, and packet rates per interface.
				</CardDescription>
			</CardHeader>
		</Card>

		<Card class="border-border/40 bg-card/50 backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:border-emerald-500/30 hover:bg-card/80">
			<CardHeader>
				<div class="mb-3 flex size-11 items-center justify-center rounded-lg bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
					<Bell class="size-5 text-emerald-400" />
				</div>
				<CardTitle class="font-mono text-base">Smart Alerts</CardTitle>
				<CardDescription>
					Configurable thresholds for CPU, RAM, and disk. Trigger warnings or critical alerts with history.
				</CardDescription>
			</CardHeader>
		</Card>

		<Card class="border-border/40 bg-card/50 backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:border-amber-500/30 hover:bg-card/80">
			<CardHeader>
				<div class="mb-3 flex size-11 items-center justify-center rounded-lg bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
					<Database class="size-5 text-amber-400" />
				</div>
				<CardTitle class="font-mono text-base">Historical Data</CardTitle>
				<CardDescription>
					Every metric stored in PostgreSQL. Query 24 hours of history with interactive time-series charts.
				</CardDescription>
			</CardHeader>
		</Card>

		<Card class="border-border/40 bg-card/50 backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:border-rose-500/30 hover:bg-card/80">
			<CardHeader>
				<div class="mb-3 flex size-11 items-center justify-center rounded-lg bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
					<Zap class="size-5 text-rose-400" />
				</div>
				<CardTitle class="font-mono text-base">WebSocket Live</CardTitle>
				<CardDescription>
					Push-based metric updates via WebSocket. See CPU/RAM/Disk change in real time without polling.
				</CardDescription>
			</CardHeader>
		</Card>
	</div>
</section>

<!-- Dual Monitoring Showcase -->
<section class="border-y border-border/40 bg-gradient-to-b from-card/20 to-background">
	<div class="container mx-auto max-w-6xl px-4 py-20 md:py-28">
		<div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
			<div class="order-2 lg:order-1">
				<p class="font-mono text-xs font-medium uppercase tracking-wider text-emerald-400">Architecture</p>
				<h2 class="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
					Local or cloud. One dashboard.
				</h2>
				<p class="mt-4 leading-relaxed text-muted-foreground">
					Monitor VirtualBox VMs on your laptop and DigitalOcean droplets in Singapore — all from the same interface. Each server gets auto-discovered, real-time metrics, history charts, and configurable alert thresholds.
				</p>

				<div class="mt-8 grid gap-4 sm:grid-cols-2">
					<div class="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
						<div class="flex items-center gap-2">
							<div class="flex size-6 items-center justify-center rounded bg-emerald-500/20">
								<Terminal class="size-3.5 text-emerald-400" />
							</div>
							<span class="font-mono text-xs font-medium text-emerald-300">LOCAL</span>
						</div>
						<p class="mt-2 text-xs text-muted-foreground">
							Ubuntu Server 24.04 on VirtualBox. Host-only network. Stress-test with <code class="rounded bg-card px-1 py-0.5 font-mono text-[11px]">stress-ng</code>.
						</p>
					</div>

					<div class="rounded-lg border border-indigo-500/20 bg-indigo-500/[0.03] p-4">
						<div class="flex items-center gap-2">
							<div class="flex size-6 items-center justify-center rounded bg-indigo-500/20">
								<Globe class="size-3.5 text-indigo-400" />
							</div>
							<span class="font-mono text-xs font-medium text-indigo-300">CLOUD</span>
						</div>
						<p class="mt-2 text-xs text-muted-foreground">
							DigitalOcean VPS on public IP. Agent sends metrics over HTTPS. Secure token-based auth.
						</p>
					</div>
				</div>
			</div>

			<div class="order-1 lg:order-2 relative">
				<div class="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 blur-sm"></div>
				<div class="relative rounded-xl border border-border/40 bg-card/90 p-5">
					<div class="mb-4 flex items-center gap-2">
						<div class="flex size-2.5 items-center justify-center rounded-full bg-red-400"></div>
						<div class="flex size-2.5 items-center justify-center rounded-full bg-amber-400"></div>
						<div class="flex size-2.5 items-center justify-center rounded-full bg-emerald-400"></div>
						<span class="ml-2 font-mono text-[10px] text-muted-foreground">terminal — cloudpulse</span>
					</div>
					<div class="space-y-1.5 font-mono text-xs leading-relaxed">
						<p>
							<span class="text-emerald-500">❯</span> <span class="text-emerald-400">agent started</span>
						</p>
						<p>
							<span class="text-muted-foreground">│</span> Server: <span class="text-blue-400">http://api.cloudpulse.dev</span>
						</p>
						<p>
							<span class="text-muted-foreground">│</span> Interval: <span class="text-amber-400">5000ms</span>
						</p>
						<p>
							<span class="text-muted-foreground">│</span> Token: <span class="text-emerald-400">sk-a1b2c3...</span>
						</p>
						<p class="mt-2">
							<span class="text-indigo-500">❯</span> <span class="text-muted-foreground">metrics → cpu: </span><span class="text-emerald-400">12.4%</span>
						</p>
						<p>
							<span class="text-muted-foreground">│</span> <span class="text-muted-foreground">ram: </span><span class="text-blue-400">42.1%</span>
						</p>
						<p>
							<span class="text-muted-foreground">│</span> <span class="text-muted-foreground">disk: </span><span class="text-violet-400">58.3%</span>
						</p>
						<p>
							<span class="text-muted-foreground">│</span> <span class="text-muted-foreground">net: </span><span class="text-amber-400">2.3MB/s ↑</span>
						</p>
						<p class="mt-2">
							<span class="text-muted-foreground">→ pinging server...</span>
						</p>
						<p>
							<span class="text-muted-foreground">← </span><span class="text-emerald-400">received ✓</span> <span class="text-muted-foreground/60">(204ms)</span>
						</p>
						<p class="mt-2 animate-pulse">
							<span class="text-muted-foreground">▌</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Testing Scenarios -->
<section class="container mx-auto max-w-6xl px-4 py-20 md:py-28">
	<div class="mb-14 text-center">
		<p class="font-mono text-xs font-medium uppercase tracking-wider text-amber-400">Testing</p>
		<h2 class="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
			Proven testing scenarios
		</h2>
		<p class="mt-3 text-muted-foreground">
			Ready-to-demo scenarios for academic defense and production validation
		</p>
	</div>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
		<div class="group rounded-lg border border-border/40 bg-card/40 p-4 transition-colors duration-200 hover:border-red-500/30">
			<div class="mb-2 font-mono text-xs text-red-400">CPU Stress</div>
			<p class="text-[13px] text-muted-foreground">
				Run <code class="rounded bg-card px-1 py-0.5 font-mono text-[11px] text-foreground/80">stress-ng --cpu 4</code> and watch CPU spike from 12% → 98% in real time.
			</p>
		</div>

		<div class="group rounded-lg border border-border/40 bg-card/40 p-4 transition-colors duration-200 hover:border-blue-500/30">
			<div class="mb-2 font-mono text-xs text-blue-400">RAM Test</div>
			<p class="text-[13px] text-muted-foreground">
				Allocate 2GB with <code class="rounded bg-card px-1 py-0.5 font-mono text-[11px] text-foreground/80">--vm 2 --vm-bytes 2G</code>. Dashboard shows RAM jump from 32% → 89%.
			</p>
		</div>

		<div class="group rounded-lg border border-border/40 bg-card/40 p-4 transition-colors duration-200 hover:border-violet-500/30">
			<div class="mb-2 font-mono text-xs text-violet-400">Disk Fill</div>
			<p class="text-[13px] text-muted-foreground">
				<code class="rounded bg-card px-1 py-0.5 font-mono text-[11px] text-foreground/80">fallocate -l 5G</code> triggers storage % increase. Alert fires when threshold crossed.
			</p>
		</div>

		<div class="group rounded-lg border border-border/40 bg-card/40 p-4 transition-colors duration-200 hover:border-amber-500/30">
			<div class="mb-2 font-mono text-xs text-amber-400">Offline Detection</div>
			<p class="text-[13px] text-muted-foreground">
				<code class="rounded bg-card px-1 py-0.5 font-mono text-[11px] text-foreground/80">shutdown now</code> on a VM. Dashboard marks it 🔴 OFFLINE with instant status update.
			</p>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="border-t border-border/40">
	<div class="container mx-auto max-w-6xl px-4 py-20 md:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<p class="font-mono text-xs font-medium uppercase tracking-wider text-indigo-400">Get Started</p>
			<h2 class="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
				Ready to monitor your infrastructure?
			</h2>
			<p class="mt-3 text-muted-foreground">
				Free and open source. Set up in under 5 minutes.
			</p>

			<div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
				{#if $sessionQuery.data}
					<Button size="lg" class="bg-indigo-600 hover:bg-indigo-500" onclick={() => goto("/dashboard")}>
						View Dashboard
						<ChevronRight class="ml-1 size-4" />
					</Button>
				{:else}
					<Button size="lg" class="bg-indigo-600 hover:bg-indigo-500" onclick={() => goto("/login")}>
						Get Started Free
						<ChevronRight class="ml-1 size-4" />
					</Button>
				{/if}
			</div>

			<div class="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
				<span class="flex items-center gap-1.5">
					<Terminal class="size-3" />
					Bun + Hono + Svelte 5
				</span>
				<span class="flex items-center gap-1.5">
					<Database class="size-3" />
					PostgreSQL + Prisma
				</span>
				<span class="flex items-center gap-1.5">
					<Zap class="size-3" />
					WebSocket Real-Time
				</span>
			</div>
		</div>
	</div>
</section>
