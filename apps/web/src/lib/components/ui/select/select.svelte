<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";

	let {
		type = "single",
		value = $bindable(""),
		...restProps
	}: SelectPrimitive.RootProps & { type?: "single"; value?: string } = $props();
</script>

<SelectPrimitive.Root {type} bind:value {...restProps} />
