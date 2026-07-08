<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  let {
    class: className,
    children,
  }: { class?: string; children?: Snippet } = $props();
</script>

<div
  data-slot="sidebar-menu-badge"
  class={cn(
    "ml-auto flex items-center justify-center rounded-full bg-sidebar-accent px-1.5 py-0.5 text-xs tabular-nums select-none group-data-[collapsible=icon]:hidden",
    className,
  )}
>
  {#if children}{@render children()}{/if}
</div>
