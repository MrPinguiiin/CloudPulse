<script lang="ts">
  interface Props {
    status: "ONLINE" | "OFFLINE" | "ERROR";
    size?: "sm" | "md";
  }

  const { status, size = "md" }: Props = $props();

  const colors: Record<string, string> = {
    ONLINE: "bg-emerald-500",
    OFFLINE: "bg-muted-foreground",
    ERROR: "bg-destructive",
  };

  const labels: Record<string, string> = {
    ONLINE: "Online",
    OFFLINE: "Offline",
    ERROR: "Error",
  };

  const dotSize = $derived(size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5");
</script>

<div class="flex items-center gap-2">
  <span class="relative flex {dotSize}">
    <span
      class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 {colors[status]}"
    ></span>
    <span class="relative inline-flex rounded-full h-full w-full {colors[status]}"></span>
  </span>
  <span class="text-xs text-muted-foreground">{labels[status]}</span>
</div>
