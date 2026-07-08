<script lang="ts">
  import { cn } from "$lib/utils";
  import { useSidebar } from "./context.svelte";
  import Button from "../button.svelte";
  import { PanelLeft } from "lucide-svelte";

	let {
		class: className,
		...restProps
	}: { class?: string } = $props();

  const sidebar = useSidebar();
</script>

<Button
  data-slot="sidebar-trigger"
  variant="ghost"
  size="icon"
  class={cn("size-8", className)}
  onclick={() => sidebar.toggle()}
  {...restProps}
>
  <PanelLeft class="size-4" />
  <span class="sr-only">Toggle Sidebar</span>
</Button>
