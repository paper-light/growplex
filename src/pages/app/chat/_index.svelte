<script lang="ts">
  import { slide } from "svelte/transition";
  import { X, Menu } from "@lucide/svelte";

  import RoomsSidebar from "@/chat/ui/widgets/RoomsSidebar.svelte";
  import Interactions from "@/chat/ui/widgets/Interactions.svelte";
  import Messages from "@/chat/ui/widgets/Messages.svelte";
  import { roomsProvider } from "@/chat/providers/rooms.svelte";
  import { socketProvider } from "@/chat/providers/socket.svelte";
  import RegisterKeydown from "@/shared/ui/RegisterKeydown.svelte";

  let sidebarOpen = $state(false);
  let sidebarEl: HTMLElement | null = $state(null);

  const room = $derived(
    roomsProvider.integrationRooms.find(
      (r) => r.id === roomsProvider.selectedRoom?.id
    ) || null
  );
  const messages = $derived.by(() => {
    if (!room) return [];
    const history = socketProvider.histories.get(room.id);
    return history || [];
  });
</script>

<RegisterKeydown keys={["Escape"]} onkeydown={() => (sidebarOpen = false)} />

<div class="flex h-full w-full">
  <!-- Mobile Sidebar Toggle Button -->
  <button
    type="button"
    class="lg:hidden fixed top-4 left-4 z-50 btn btn-primary btn-circle"
    aria-label="Open sidebar"
    onclick={() => (sidebarOpen = true)}
  >
    <Menu size={20} />
  </button>

  <!-- Sidebar - Hidden on mobile when closed, always visible on desktop -->
  <aside
    bind:this={sidebarEl}
    class="fixed lg:static top-0 left-0 h-full w-80 bg-base-100 border-r border-base-300 z-40 lg:z-auto"
    class:translate-x-0={sidebarOpen}
    class:-translate-x-full={!sidebarOpen}
    class:lg:translate-x-0={true}
    transition:slide={{ axis: "x" }}
    aria-label="Rooms sidebar"
    tabindex="-1"
    onintroend={() => sidebarEl?.focus()}
  >
    <!-- Mobile Close Button -->
    <button
      type="button"
      class="lg:hidden btn btn-sm btn-ghost btn-circle absolute top-4 right-4 z-10"
      aria-label="Close sidebar"
      onclick={() => (sidebarOpen = false)}
    >
      <X size={20} />
    </button>

    <!-- Sidebar Content -->
    <div class="h-full pt-16 lg:pt-0">
      <RoomsSidebar />
    </div>
  </aside>

  <!-- Main Content Area -->
  <div class="flex flex-col flex-1 min-w-0">
    <main class="flex-1 overflow-hidden">
      <Messages class="px-12 py-4" {messages} mode="operator" />
    </main>

    <footer class="flex-shrink-0">
      <Interactions mode="admin" />
    </footer>
  </div>

  <!-- Mobile Overlay -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 bg-black/40 z-30 lg:hidden"
      onclick={() => (sidebarOpen = false)}
      aria-hidden="true"
    ></div>
  {/if}
</div>
