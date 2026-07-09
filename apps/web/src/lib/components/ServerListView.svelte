<script lang="ts">
  import { Pencil, Trash2 } from 'lucide-svelte';

  interface ServerRow {
    id: string;
    name: string;
    ip: string;
    status: string;
    location: string;
    cpu: number | null;
    ram: number | null;
    disk: number | null;
    uptime: string | null;
  }

  interface Props {
    servers: ServerRow[];
    onclick?: (id: string) => void;
    onedit?: (id: string) => void;
    ondelete?: (id: string) => void;
  }

  const { servers, onclick, onedit, ondelete }: Props = $props();
</script>

<div class="overflow-x-auto rounded-lg border border-border bg-card">
  <table class="w-full">
    <thead>
      <tr class="border-b border-border bg-muted">
        <th class="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Server</th>
        <th class="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">IP Address</th>
        <th class="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
        <th class="px-6 py-3 text-center text-xs font-semibold text-muted-foreground">CPU</th>
        <th class="px-6 py-3 text-center text-xs font-semibold text-muted-foreground">RAM</th>
        <th class="px-6 py-3 text-center text-xs font-semibold text-muted-foreground">Disk</th>
        <th class="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Uptime</th>
        <th class="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-border">
      {#each servers as server (server.id)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <tr class="transition-colors hover:bg-muted/50 {onclick ? 'cursor-pointer' : ''}" onclick={() => onclick?.(server.id)} onkeydown={() => {}}>
          <td class="px-6 py-4">
            <div>
              <p class="font-medium text-foreground">{server.name}</p>
              <p class="text-xs text-muted-foreground">{server.location}</p>
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-foreground">{server.ip}</td>
          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full {server.status === 'ONLINE' ? 'bg-accent' : 'bg-muted-foreground'}"></span>
              <span class="text-xs font-medium capitalize {server.status === 'ONLINE' ? 'text-accent' : 'text-muted-foreground'}">
                {server.status === 'ONLINE' ? 'online' : 'offline'}
              </span>
            </div>
          </td>
          <td class="px-6 py-4 text-center text-sm">
            {#if server.cpu !== null}
              <span class="text-chart-1 font-medium">{server.cpu.toFixed(1)}%</span>
            {:else}
              <span class="text-muted-foreground">—</span>
            {/if}
          </td>
          <td class="px-6 py-4 text-center text-sm">
            {#if server.ram !== null}
              <span class="font-medium {server.ram > 80 ? 'text-destructive' : server.ram > 60 ? 'text-chart-3' : 'text-chart-2'}">
                {server.ram.toFixed(1)}%
              </span>
            {:else}
              <span class="text-muted-foreground">—</span>
            {/if}
          </td>
          <td class="px-6 py-4 text-center text-sm">
            {#if server.disk !== null}
              <span class="font-medium text-foreground">{server.disk.toFixed(1)}%</span>
            {:else}
              <span class="text-muted-foreground">—</span>
            {/if}
          </td>
          <td class="px-6 py-4 text-sm text-foreground">
            {#if server.uptime}
              {server.uptime}
            {:else}
              <span class="text-muted-foreground">—</span>
            {/if}
          </td>
          <td class="px-6 py-4">
            <div class="flex justify-end gap-2">
              {#if onedit}
                <button class="rounded p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" onclick={(e) => { e.stopPropagation(); onedit(server.id); }}>
                  <Pencil class="size-4" />
                </button>
              {/if}
              {#if ondelete}
                <button class="rounded p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" onclick={(e) => { e.stopPropagation(); ondelete(server.id); }}>
                  <Trash2 class="size-4" />
                </button>
              {/if}
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
