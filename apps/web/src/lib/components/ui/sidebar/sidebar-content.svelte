<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  let {
    class: className,
    children,
  }: { class?: string; children?: Snippet } = $props();
</script>

<div
  data-slot="sidebar-content"
  class={cn(
    "flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden",
    className,
  )}
>
  {#if children}{@render children()}{/if}
</div>
