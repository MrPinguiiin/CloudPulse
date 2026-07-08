<script lang="ts">
	import SidebarRoot from "$lib/components/ui/sidebar/sidebar.svelte";
	import SidebarHeader from "$lib/components/ui/sidebar/sidebar-header.svelte";
	import SidebarContent from "$lib/components/ui/sidebar/sidebar-content.svelte";
	import NavMain from "./nav-main.svelte";
	import NavUser from "./nav-user.svelte";
	import {
		Server,
		LayoutDashboard,
		Bell,
		Settings,
	} from "lucide-svelte";
	import { Activity } from "lucide-svelte";
	import { page } from "$app/stores";

	const currentPath = $derived($page.url.pathname);

	const links = [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: LayoutDashboard,
		},
		{
			title: "Servers",
			url: "/dashboard",
			icon: Server,
		},
		{
			title: "Alerts",
			url: "/alerts",
			icon: Bell,
		},
		{
			title: "Settings",
			url: "/settings",
			icon: Settings,
		},
	];
</script>

<SidebarRoot collapsible="icon">
	<SidebarHeader>
		<div class="flex items-center gap-2 px-2 py-1">
			<div class="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary">
				<Activity class="size-3.5 text-sidebar-primary-foreground" />
			</div>
			<span class="font-mono font-semibold text-sm tracking-tight group-data-[collapsible=icon]:hidden">
				CloudPulse
			</span>
		</div>
	</SidebarHeader>
	<SidebarContent>
		<NavMain {links} />
	</SidebarContent>
	<NavUser />
</SidebarRoot>
