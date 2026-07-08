<script lang="ts">
  interface Props {
    label: string;
    value: string;
    last?: boolean;
  }

  const { label, value, last = false }: Props = $props();
</script>

<div class="flex items-center justify-between py-3 border-b border-border {last ? 'border-b-0' : ''}">
  <span class="text-sm text-muted-foreground">{label}</span>
  <span class="font-medium text-foreground">{value}</span>
</div>
