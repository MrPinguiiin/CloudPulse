<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    orientation = "horizontal" as "horizontal" | "vertical",
    class: className,
  } = $props();
</script>

<div
  data-slot="sidebar-separator"
  role="separator"
  aria-orientation={orientation}
  class={cn(
    "bg-border shrink-0",
    orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
    className,
  )}
></div>
