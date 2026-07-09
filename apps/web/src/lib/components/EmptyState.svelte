<script lang="ts">
  import { Server } from 'lucide-svelte';
  import Button from './ui/button.svelte';
  import { Plus } from 'lucide-svelte';

  interface Props {
    onadd?: () => void;
  }

  const { onadd }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-20 text-center">
  <div class="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
    <Server class="size-6 text-muted-foreground" />
  </div>
  <p class="mb-1 font-medium">No servers added yet</p>
  <p class="mb-4 text-sm text-muted-foreground">Add your first server to start monitoring.</p>
  {#if onadd}
    <Button onclick={onadd}>
      <Plus class="size-4 mr-1.5" />
      Add Server
    </Button>
  {/if}
</div>
