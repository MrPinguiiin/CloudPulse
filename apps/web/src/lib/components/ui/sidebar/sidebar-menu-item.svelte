<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  let {
    class: className,
    children,
  }: { class?: string; children?: Snippet } = $props();
</script>

<li
  data-slot="sidebar-menu-item"
  class={cn("group/menu-item relative", className)}
>
  {#if children}{@render children()}{/if}
</li>
