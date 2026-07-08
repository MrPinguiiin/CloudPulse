<script lang="ts">
  interface Props {
    label: string;
    value: number;
    max?: number;
    unit?: string;
    color?: string;
  }

  const { label, value, max = 100, unit = "%", color = "text-green-400" }: Props = $props();

  const clamped = $derived(Math.min(Math.max(value, 0), max));
  const pct = $derived(max > 0 ? (clamped / max) * 100 : 0);

  const gaugeColors: Record<string, string> = {
    "text-green-400": "#4ade80",
    "text-blue-400": "#60a5fa",
    "text-yellow-400": "#facc15",
    "text-red-400": "#f87171",
    "text-purple-400": "#c084fc",
  };
  const strokeColor = $derived(gaugeColors[color] ?? "#4ade80");
  const bgColor = "#27272a";

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = $derived(circumference - (pct / 100) * circumference);
</script>

<div class="flex flex-col items-center gap-1">
  <div class="relative w-24 h-24">
    <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
      <circle
        cx="50" cy="50" r={radius}
        fill="none" stroke={bgColor} stroke-width="8"
      />
      <circle
        cx="50" cy="50" r={radius}
        fill="none" stroke={strokeColor} stroke-width="8"
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={dashOffset}
        style="transition: stroke-dashoffset 0.5s ease"
      />
    </svg>
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-lg font-semibold tabular-nums {color}">
        {clamped.toFixed(1)}{unit}
      </span>
    </div>
  </div>
  <span class="text-xs text-neutral-400">{label}</span>
</div>
