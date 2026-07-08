<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  let {
    class: className,
    children,
  }: { class?: string; children?: Snippet } = $props();
</script>

<div
  data-slot="sidebar-header"
  class={cn("flex flex-col gap-2 p-2", className)}
>
  {#if children}{@render children()}{/if}
</div>
