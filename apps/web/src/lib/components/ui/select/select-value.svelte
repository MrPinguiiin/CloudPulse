<script lang="ts">
	import { cn } from "$lib/utils";
	import { Select as SelectPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		placeholder,
		children,
		...restProps
	}: SelectPrimitive.ValueProps & {
		placeholder?: string;
		children?: Snippet;
	} = $props();
</script>

<SelectPrimitive.Value bind:ref data-slot="select-value" class={cn("data-[placeholder]:text-muted-foreground", className)} placeholder={placeholder} {...restProps}>
	{#if children}{@render children()}{/if}
</SelectPrimitive.Value>
