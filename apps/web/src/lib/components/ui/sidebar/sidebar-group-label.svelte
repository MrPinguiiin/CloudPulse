<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  let {
    class: className,
    children,
  }: { class?: string; children?: Snippet } = $props();
</script>

<div
  data-slot="sidebar-group-label"
  class={cn(
    "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none",
    className,
  )}
>
  {#if children}{@render children()}{/if}
</div>
