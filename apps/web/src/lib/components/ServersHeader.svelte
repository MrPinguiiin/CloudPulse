<script lang="ts">
  import { Plus, Grid3x3, List } from 'lucide-svelte';
  import Button from './ui/button.svelte';

  interface Props {
    serverCount: number;
    view: 'grid' | 'list';
    onadd?: () => void;
  }

  let { serverCount, view = $bindable('grid' as 'grid' | 'list'), onadd }: Props = $props();
</script>

<header class="border-b border-border bg-card">
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex-1">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Servers</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {serverCount} server{serverCount !== 1 ? 's' : ''} in your infrastructure
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <div class="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
          <button
            onclick={() => view = 'grid'}
            class="rounded p-2 transition-colors {view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}"
            title="Grid view"
          >
            <Grid3x3 class="size-4" />
          </button>
          <button
            onclick={() => view = 'list'}
            class="rounded p-2 transition-colors {view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}"
            title="List view"
          >
            <List class="size-4" />
          </button>
        </div>

        {#if onadd}
          <Button onclick={onadd}>
            <Plus class="size-4 mr-1.5" />
            Add Server
          </Button>
        {/if}
      </div>
    </div>
  </div>
</header>
