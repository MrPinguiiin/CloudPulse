<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn, type WithElementRef } from "$lib/utils";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    children?: import("svelte").Snippet;
  } = $props();
</script>

<div
  bind:this={ref}
  data-slot="card"
  class={cn(
    "rounded-xl border bg-card text-card-foreground shadow-sm",
    className,
  )}
  {...restProps}
>
  {#if children}{@render children()}{/if}
</div>
