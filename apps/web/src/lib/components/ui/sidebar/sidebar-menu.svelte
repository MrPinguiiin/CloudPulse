<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  let {
    class: className,
    children,
  }: { class?: string; children?: Snippet } = $props();
</script>

<ul
  data-slot="sidebar-menu"
  class={cn("flex w-full min-w-0 flex-col gap-1", className)}
>
  {#if children}{@render children()}{/if}
</ul>
