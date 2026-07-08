<script lang="ts">
	import { cn } from "$lib/utils";
	import { Select as SelectPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: SelectPrimitive.ItemProps & { children?: Snippet } = $props();
</script>

<SelectPrimitive.Item
	bind:ref
	data-slot="select-item"
	class={cn(
		"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		className,
	)}
	{...restProps}
>
	{#if children}{@render children()}{/if}
</SelectPrimitive.Item>
