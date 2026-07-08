<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  let {
    class: className,
    children,
  }: { class?: string; children?: Snippet } = $props();
</script>

<div
  data-slot="sidebar-group-content"
  class={cn("w-full text-sm", className)}
>
  {#if children}{@render children()}{/if}
</div>
