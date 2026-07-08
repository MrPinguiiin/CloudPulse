<script lang="ts" module>
  import { tv, type VariantProps } from "tailwind-variants";

  export const sidebarMenuButtonVariants = tv({
    base: "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0 [&>span:last-child]:truncate",
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  });
</script>

<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    ref = $bindable(null),
    class: className,
    isActive = false,
    variant = "default" as "default" | "outline",
    size = "default" as "default" | "sm" | "lg",
    children,
    onclick,
    href,
    ...restProps
  }: Record<string, unknown> & {
    isActive?: boolean;
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
    children?: import("svelte").Snippet;
    ref?: HTMLButtonElement | HTMLAnchorElement | null;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    href?: string;
    tooltipContent?: string;
  } = $props();
</script>

{#if href}
  <a
    bind:this={ref as HTMLAnchorElement | null}
    data-slot="sidebar-menu-button"
    data-size={size}
    data-active={isActive}
    class={cn(sidebarMenuButtonVariants({ variant, size }), isActive && "bg-sidebar-accent text-sidebar-accent-foreground", className)}
    {href}
    {...restProps}
  >
    {#if children}{@render children()}{/if}
  </a>
{:else}
  <button
    bind:this={ref as HTMLButtonElement | null}
    data-slot="sidebar-menu-button"
    data-size={size}
    data-active={isActive}
    class={cn(sidebarMenuButtonVariants({ variant, size }), isActive && "bg-sidebar-accent text-sidebar-accent-foreground", className)}
    {onclick}
    {...restProps}
  >
    {#if children}{@render children()}{/if}
  </button>
{/if}
