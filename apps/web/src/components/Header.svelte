<script lang="ts">
	import Button from "$lib/components/ui/button.svelte";
	import { authClient } from "$lib/auth-client";
	import { goto } from "$app/navigation";
	import { Activity } from "lucide-svelte";

	const sessionQuery = authClient.useSession();

	async function handleSignOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => goto("/"),
			},
		});
	}
</script>

<header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="container mx-auto flex h-14 max-w-6xl items-center px-4">
		<a href="/" class="mr-4 flex items-center gap-2">
			<div class="flex size-6 items-center justify-center rounded-md bg-primary">
				<Activity class="size-3.5 text-primary-foreground" />
			</div>
			<span class="font-mono font-semibold text-sm tracking-tight">CloudPulse</span>
		</a>

		<nav class="flex items-center gap-4 text-sm ml-6">
			<a href="/" class="text-foreground/60 transition-colors hover:text-foreground">
				Home
			</a>
			{#if $sessionQuery.data}
				<a href="/dashboard" class="text-foreground/60 transition-colors hover:text-foreground">
					Servers
				</a>
			{/if}
		</nav>

		<div class="ml-auto flex items-center gap-2">
			{#if $sessionQuery.isPending}
				<div class="h-8 w-20 animate-pulse rounded bg-muted"></div>
			{:else if $sessionQuery.data?.user}
				<span class="text-xs text-muted-foreground hidden sm:inline">
					{$sessionQuery.data.user.name ?? $sessionQuery.data.user.email?.split("@")[0]}
				</span>
				<Button variant="ghost" size="sm" onclick={handleSignOut}>
					Sign Out
				</Button>
			{:else}
				<Button variant="ghost" size="sm" onclick={() => goto("/login")}>
					Sign In
				</Button>
				<Button size="sm" class="bg-indigo-600 hover:bg-indigo-500" onclick={() => goto("/login")}>
					Get Started
				</Button>
			{/if}
		</div>
	</div>
</header>
