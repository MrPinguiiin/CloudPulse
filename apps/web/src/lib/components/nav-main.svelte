<script lang="ts">
  import SidebarGroup from "$lib/components/ui/sidebar/sidebar-group.svelte";
  import SidebarGroupLabel from "$lib/components/ui/sidebar/sidebar-group-label.svelte";
  import SidebarGroupContent from "$lib/components/ui/sidebar/sidebar-group-content.svelte";
  import SidebarMenu from "$lib/components/ui/sidebar/sidebar-menu.svelte";
  import SidebarMenuItem from "$lib/components/ui/sidebar/sidebar-menu-item.svelte";
  import SidebarMenuButton from "$lib/components/ui/sidebar/sidebar-menu-button.svelte";
  import SidebarMenuBadge from "$lib/components/ui/sidebar/sidebar-menu-badge.svelte";
  import { page } from "$app/stores";

  interface NavItem {
    title: string;
    url: string;
    icon?: any;
    isActive?: boolean;
    badge?: number;
  }

  let { links }: { links: NavItem[] } = $props();

  const currentPath = $derived($page.url.pathname);
</script>

<SidebarGroup>
  <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
  <SidebarGroupContent>
    <SidebarMenu>
      {#each links as item (item.title)}
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={item.isActive ?? (currentPath === item.url || currentPath.startsWith(item.url + "/"))}
          >
            <a href={item.url} class="flex w-full items-center gap-2">
              {#if item.icon}
                <item.icon class="size-4 text-muted-foreground group-hover/menu-button:text-foreground" />
              {/if}
              <span>{item.title}</span>
            </a>
            {#if item.badge != null}
              <SidebarMenuBadge>
                {item.badge}
              </SidebarMenuBadge>
            {/if}
          </SidebarMenuButton>
        </SidebarMenuItem>
      {/each}
    </SidebarMenu>
  </SidebarGroupContent>
</SidebarGroup>
