<script lang="ts">
	import { cn } from "$lib/utils";
	import { Select as SelectPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import { ChevronDown } from "lucide-svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: SelectPrimitive.TriggerProps & { children?: Snippet } = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	class={cn(
		"flex h-9 w-full items-center justify-between whitespace-nowrap rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
		className,
	)}
	{...restProps}
>
	{#if children}{@render children()}{/if}
	<ChevronDown class="size-4 shrink-0 text-muted-foreground/80" />
</SelectPrimitive.Trigger>
