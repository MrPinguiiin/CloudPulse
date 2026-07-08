<script lang="ts">
  import { cn } from "$lib/utils";
  import { useSidebar } from "./context.svelte";
  import { SIDEBAR_WIDTH_MOBILE } from "./constants";

  let {
    ref = $bindable(null),
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    class: className,
    children,
    ...restProps
  }: Record<string, unknown> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
    children?: import("svelte").Snippet;
    ref?: HTMLDivElement | null;
    class?: string;
  } = $props();

  const sidebar = useSidebar();
  const state = $derived(sidebar.state);
</script>

<div
  bind:this={ref}
  class="text-sidebar-foreground group peer hidden md:block"
  data-state={state}
  data-collapsible={state === "collapsed" ? collapsible : ""}
  data-variant={variant}
  data-side={side}
  data-slot="sidebar"
>
  <div
    data-slot="sidebar-gap"
    class={cn(
      "relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear",
      "group-data-[collapsible=offcanvas]:w-0",
      "group-data-[side=right]:rotate-180",
      variant === "floating" || variant === "inset"
        ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
        : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]",
    )}
  ></div>

  <div
    data-slot="sidebar-container"
    class={cn(
      "fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex",
      side === "left"
        ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
        : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
      variant === "floating" || variant === "inset"
        ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]"
        : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l border-border/40",
      className,
    )}
    {...restProps}
  >
    <div
      data-sidebar="sidebar"
      data-slot="sidebar-inner"
      class="flex size-full flex-col bg-card border-border/40 rounded-[inherit]"
    >
      {#if children}{@render children()}{/if}
    </div>
  </div>
</div>
