<script lang="ts">
  interface Props {
    label: string;
    value: number;
    max?: number;
    color?: 'chart-1' | 'chart-2' | 'chart-3' | 'destructive' | 'accent';
  }

  const { label, value = 0, max = 100, color = 'chart-1' }: Props = $props();

  const pct = $derived(max > 0 ? Math.min(100, (value / max) * 100) : 0);
  const r = 40;
  const circ = 2 * Math.PI * r;

  const strokeClass = $derived(
    color === 'destructive' ? 'text-destructive' :
    color === 'accent' ? 'text-accent' :
    color === 'chart-1' ? 'text-chart-1' :
    color === 'chart-2' ? 'text-chart-2' :
    color === 'chart-3' ? 'text-chart-3' :
    'text-chart-1'
  );
</script>

<div class="flex flex-col items-center gap-2">
  <div class="relative h-16 w-16">
    <svg class="h-full w-full -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" stroke-width="2" class="text-muted" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-dasharray={`${(pct / 100) * circ} ${circ}`}
        stroke-linecap="round"
        class={strokeClass}
      />
    </svg>
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-xs font-bold text-foreground">{Math.round(pct)}%</span>
    </div>
  </div>
  <p class="text-xs font-medium text-muted-foreground">{label}</p>
</div>
