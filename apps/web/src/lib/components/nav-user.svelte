<script lang="ts">
  import SidebarFooter from "$lib/components/ui/sidebar/sidebar-footer.svelte";
  import SidebarMenu from "$lib/components/ui/sidebar/sidebar-menu.svelte";
  import SidebarMenuItem from "$lib/components/ui/sidebar/sidebar-menu-item.svelte";
  import SidebarMenuButton from "$lib/components/ui/sidebar/sidebar-menu-button.svelte";
  import {
    ChevronsUpDown,
    LogOut,
    User,
  } from "lucide-svelte";
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";

  const session = authClient.useSession();
  let sessionData = $derived($session?.data);
  let userData = $derived({
    name: sessionData?.user?.name ?? "User",
    email: sessionData?.user?.email ?? "",
  });

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => goto("/"),
      },
    });
  }
</script>

<SidebarFooter>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton size="lg">
        <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
          <User class="size-4" />
        </div>
        <div class="grid flex-1 text-start text-sm leading-tight">
          <span class="truncate font-medium">{userData.name}</span>
          <span class="truncate text-xs text-muted-foreground">{userData.email}</span>
        </div>
        <ChevronsUpDown class="ms-auto size-4 text-muted-foreground" />
      </SidebarMenuButton>
    </SidebarMenuItem>

    <SidebarMenuItem>
      <SidebarMenuButton onclick={handleSignOut}>
        <LogOut class="size-4 text-muted-foreground" />
        <span>Sign Out</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarFooter>
