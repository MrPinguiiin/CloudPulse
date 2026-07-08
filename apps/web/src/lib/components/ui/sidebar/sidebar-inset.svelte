<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  let {
    class: className,
    children,
  }: { class?: string; children?: Snippet } = $props();
</script>

<main
  data-slot="sidebar-inset"
  class={cn("relative flex w-full flex-1 flex-col bg-background", className)}
>
  {#if children}{@render children()}{/if}
</main>
