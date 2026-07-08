<script lang="ts">
	import { QueryClientProvider } from "@tanstack/svelte-query";
	import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
	import { ModeWatcher } from "mode-watcher";
	import "../app.css";
	import { queryClient } from "$lib/orpc";

	const { children } = $props();
</script>

<ModeWatcher />
<QueryClientProvider client={queryClient}>
	{@render children()}
	<SvelteQueryDevtools />
</QueryClientProvider>
