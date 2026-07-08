<script lang="ts">
  import { cn } from "$lib/utils";
  import {
    SIDEBAR_COOKIE_MAX_AGE,
    SIDEBAR_COOKIE_NAME,
    SIDEBAR_WIDTH,
    SIDEBAR_WIDTH_ICON,
  } from "./constants";
  import { setSidebar } from "./context.svelte";

  let {
    ref = $bindable(null),
    open = $bindable(true),
    class: className,
    style,
    children,
    ...restProps
  }: Record<string, unknown> & {
    open?: boolean;
    children?: import("svelte").Snippet;
    ref?: HTMLDivElement | null;
    class?: string;
    style?: string;
  } = $props();

  const sidebar = setSidebar({
    open: () => open,
    setOpen: (value: boolean) => {
      open = value;
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
  });
</script>

<div
  data-slot="sidebar-wrapper"
  style="--sidebar-width: {SIDEBAR_WIDTH}; --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {style}"
  class={cn(
    "group/sidebar-wrapper flex min-h-svh w-full",
    className,
  )}
  bind:this={ref}
  {...restProps}
>
  {#if children}{@render children()}{/if}
</div>
