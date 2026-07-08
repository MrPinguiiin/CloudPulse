<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import { Activity } from "lucide-svelte";

	const { children } = $props();
</script>

<div class="relative flex min-h-screen flex-col bg-background">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<footer class="border-t border-border/40 py-6">
		<div class="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<div class="flex size-5 items-center justify-center rounded bg-indigo-500/20">
					<Activity class="size-3 text-indigo-400" />
				</div>
				<span class="font-mono text-xs text-muted-foreground">CloudPulse</span>
			</div>
			<p class="font-mono text-xs text-muted-foreground/60">
				Agent-based infrastructure monitoring
			</p>
		</div>
	</footer>
</div>
