<script lang="ts">
  interface Props {
    label: string;
    value: number;
    max?: number;
    unit?: string;
    detail?: string;
    gradientFrom?: string;
    gradientTo?: string;
  }

  const { label, value = 0, max = 100, unit = "%", detail = "", gradientFrom = "#10b981", gradientTo = "#059669" }: Props = $props();

  const safe = $derived(Math.max(0, Math.min(100, Number(value) || 0)));
  const circumference = 2 * Math.PI * 45;
  const offset = $derived(circumference - (safe / 100) * circumference);

  const gradientId = $derived(`gauge-${label.replace(/\s/g, "")}`);
</script>

<div class="flex flex-col items-center gap-2">
  <div class="relative w-36 h-36">
    <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color={gradientFrom} />
          <stop offset="100%" stop-color={gradientTo} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="6" class="text-muted/30" />
      <circle
        cx="50" cy="50" r="45"
        fill="none"
        stroke={`url(#${gradientId})`}
        stroke-width="6"
        stroke-dasharray={circumference}
        stroke-dashoffset={offset}
        stroke-linecap="round"
        style="transition: stroke-dashoffset 0.6s ease-out"
      />
    </svg>
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="text-center">
        <div class="text-3xl font-bold tabular-nums" style="transition: all 0.4s ease">
          {safe.toFixed(1)}{unit}
        </div>
      </div>
    </div>
  </div>
  <div class="text-center">
    <div class="text-sm font-semibold text-foreground">{label}</div>
    {#if detail}
      <div class="text-xs text-muted-foreground mt-0.5">{detail}</div>
    {/if}
  </div>
</div>
