<script lang="ts">
  import MetricGaugeRing from './MetricGaugeRing.svelte';
  import { Pencil, Trash2 } from 'lucide-svelte';

  interface Props {
    id: string;
    name: string;
    ip: string;
    status: string;
    location: string;
    cpu: number | null;
    ram: number | null;
    disk: number | null;
    network: string | null;
    uptime: string | null;
    onclick?: (id: string) => void;
    onedit?: () => void;
    ondelete?: () => void;
  }

  const { id, name, ip, status, location, cpu, ram, disk, network, uptime, onclick, onedit, ondelete }: Props = $props();

  const isOnline = $derived(status === 'ONLINE');
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30 {onclick ? 'cursor-pointer' : ''}" onclick={() => onclick?.(id)} onkeydown={() => {}}>
  <div class="border-b border-border bg-gradient-to-r from-card to-muted p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="h-3 w-3 rounded-full flex-shrink-0 {isOnline ? 'bg-accent' : 'bg-muted-foreground'}"></span>
          <h3 class="text-sm font-semibold text-muted-foreground">{location}</h3>
          <span class="text-xs font-medium {isOnline ? 'text-accent' : 'text-muted-foreground'}">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <h2 class="text-lg font-bold text-foreground truncate">{name}</h2>
        <p class="text-xs text-muted-foreground mt-1">{ip}</p>
      </div>
      <div class="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {#if onedit}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <button class="rounded p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" onclick={(e) => { e.stopPropagation(); onedit(); }}>
            <Pencil class="size-4" />
          </button>
        {/if}
        {#if ondelete}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <button class="rounded p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" onclick={(e) => { e.stopPropagation(); ondelete(); }}>
            <Trash2 class="size-4" />
          </button>
        {/if}
      </div>
    </div>
  </div>

  <div class="p-4">
    {#if isOnline && cpu !== null}
      <div class="grid grid-cols-3 gap-3 mb-4">
        <MetricGaugeRing label="CPU" value={cpu} max={100} color="chart-1" />
        <MetricGaugeRing
          label="RAM"
          value={ram || 0}
          max={100}
          color={(ram || 0) > 80 ? 'destructive' : (ram || 0) > 60 ? 'chart-3' : 'chart-2'}
        />
        <MetricGaugeRing label="Disk" value={disk || 0} max={100} color="chart-2" />
      </div>
      <div class="space-y-2 border-t border-border pt-3 text-xs">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Network</span>
          <span class="font-medium text-foreground">{network ?? '—'}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Uptime</span>
          <span class="font-medium text-foreground">{uptime ?? '—'}</span>
        </div>
      </div>
    {:else}
      <div class="py-8 text-center">
        <p class="text-sm text-muted-foreground">
          {isOnline ? 'No metrics available' : 'Server is offline'}
        </p>
      </div>
    {/if}
  </div>
</div>
