<script lang="ts">
  interface DataPoint {
    timestamp: string;
    value: number;
  }

  interface Props {
    data: DataPoint[];
    color?: string;
    label?: string;
    maxY?: number;
    height?: number;
  }

  const { data, color = "#a78bfa", label = "", maxY = 100, height = 120 }: Props = $props();

  const chartWidth = 500;
  const padding = { top: 10, right: 10, bottom: 20, left: 5 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = $derived(height - padding.top - padding.bottom);

  const pathData = $derived.by(() => {
    if (data.length < 2) return "";
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - (Math.min(d.value, maxY) / maxY) * innerHeight;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    });
    return points.join(" ");
  });

  const areaData = $derived.by(() => {
    if (data.length < 2) return "";
    const firstX = padding.left;
    const lastX = padding.left + innerWidth;
    const bottomY = padding.top + innerHeight;
    return `${pathData} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  });

  const lastLabel = $derived.by(() => {
    if (data.length === 0) return "";
    return `${data[data.length - 1]!.value.toFixed(1)}%`;
  });
</script>

<div class="relative">
  {#if label || lastLabel}
    <div class="flex justify-between mb-1">
      <span class="text-xs text-muted-foreground">{label}</span>
      <span class="text-xs font-mono tabular-nums text-muted-foreground">{lastLabel}</span>
    </div>
  {/if}
  <svg viewBox={`0 0 ${chartWidth} ${height}`} class="w-full" style="height: {height}px">
    {#if data.length >= 2}
      <defs>
        <linearGradient id={`areaGrad-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color={color} stop-opacity="0.2" />
          <stop offset="100%" stop-color={color} stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d={areaData} fill={`url(#areaGrad-${label})`} />
      <path d={pathData} fill="none" stroke={color} stroke-width="2" />
    {/if}
    {#if data.length === 0}
      <text x={chartWidth / 2} y={height / 2} text-anchor="middle"
        class="text-xs fill-muted-foreground">No data</text>
    {/if}
  </svg>
</div>
