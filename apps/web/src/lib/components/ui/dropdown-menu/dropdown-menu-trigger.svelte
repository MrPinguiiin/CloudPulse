<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: DropdownMenuPrimitive.TriggerProps & {
		children?: Snippet;
	} = $props();
</script>

<DropdownMenuPrimitive.Trigger bind:ref data-slot="dropdown-menu-trigger" {...restProps}>
	{#if children}{@render children()}{/if}
</DropdownMenuPrimitive.Trigger>
