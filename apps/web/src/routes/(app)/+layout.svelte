<script lang="ts">
	import SidebarProvider from "$lib/components/ui/sidebar/sidebar-provider.svelte";
	import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
	import SidebarInset from "$lib/components/ui/sidebar/sidebar-inset.svelte";
	import SidebarSeparator from "$lib/components/ui/sidebar/sidebar-separator.svelte";
	import AppSidebar from "$lib/components/app-sidebar.svelte";

	const { children } = $props();
</script>

<SidebarProvider>
	<AppSidebar />
	<SidebarInset>
		<header class="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
			<SidebarTrigger />
			<SidebarSeparator orientation="vertical" class="h-4" />
			<div class="flex-1"></div>
		</header>
		<div class="flex flex-1 flex-col">
			{@render children()}
		</div>
	</SidebarInset>
</SidebarProvider>
