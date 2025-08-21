<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";

  import Interactions from "@/chat/ui/widgets/Interactions.svelte";
  import Messages from "@/messages/ui/widgets/Messages.svelte";
  import { roomsProvider } from "@/chat/providers/rooms.svelte";
  import { socketProvider } from "@/chat/providers/socket.svelte";
  import type { RoomsResponse } from "@/shared/models/pocketbase-types";
  import { settingsProvider } from "@/user/settings.svelte";
  import { userProvider } from "@/user/user.svelte";
  import { pb } from "@/shared/lib/pb";
  import Man from "@/shared/assets/Man.jpg";
  import { agentsProvider } from "@/agent/providers/agents.svelte";
  import type { Sender } from "@/chat/providers/socket.svelte";

  const ROOM_STATUSES = [
    { value: "operator", label: "Operator", color: "success" },
    { value: "waitingOperator", label: "Waiting", color: "warning" },
    { value: "auto", label: "Auto", color: "info" },
    { value: "seeded", label: "Seeded", color: "secondary" },
  ];

  const user = $derived(userProvider.user);
  const avatar = $derived(
    user?.avatar ? pb.files.getURL(user, user.avatar) : Man.src
  );

  const sender: Sender = $derived({
    id: user?.id || "",
    avatar,
    name: user?.name || "Admin",
    role: "admin",
  });

  const integrationAgents = $derived(agentsProvider.integrationAgents);

  const rooms = $derived(roomsProvider.integrationRooms);
  const selectedRoom = $derived(roomsProvider.selectedRoom);

  const filteredRooms = $derived.by(() => {
    if (!rooms.length) return [];

    let filtered = rooms.filter((r) => r.type === "chatWidget");
    if (selectedTypes.size > 0)
      filtered = filtered.filter((room) => selectedTypes.has(room.status));

    return filtered;
  });
  const sortedRooms = $derived(filteredRooms.sort(sortRooms));

  const messages = $derived.by(() => {
    if (!selectedRoom) return [];
    const history = socketProvider.histories.get(selectedRoom.id);
    return history || [];
  });

  // SCROLL AND HTML
  let sidebarScroll = $state<HTMLElement | null>(null);
  let roomListElement: HTMLDivElement | null = $state(null);
  let scrollPosition = $state(0);

  // FILTERS
  let selectedTypes = $state<Set<string>>(new SvelteSet());

  function sortRooms(a: RoomsResponse, b: RoomsResponse) {
    const order = {
      operator: 0,
      waitingOperator: 1,
      auto: 2,
      seeded: 3,
    };
    return (order[a.status] ?? 99) - (order[b.status] ?? 99);
  }

  function saveScrollPosition() {
    if (roomListElement) {
      scrollPosition = roomListElement.scrollTop;
    }
  }

  function restoreScrollPosition() {
    if (roomListElement && scrollPosition > 0) {
      roomListElement.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }
  $effect(() => {
    document.addEventListener("astro:after-swap", restoreScrollPosition);

    return () => {
      document.removeEventListener("astro:after-swap", restoreScrollPosition);
    };
  });

  async function handleRoomClick(room: RoomsResponse) {
    saveScrollPosition();
    settingsProvider.selectRoom(room.id);
  }

  async function handleIntegrationChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    settingsProvider.selectIntegration(target.value);
  }

  function toggleTypeFilter(type: string) {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    selectedTypes = newSelected;
  }

  function getStatusInfo(status: string) {
    const statusMap: Record<string, { label: string; color: string }> = {
      operator: { label: "Operator", color: "badge-success" },
      waitingOperator: { label: "Waiting", color: "badge-warning" },
      auto: { label: "Auto", color: "badge-info" },
      seeded: { label: "Seeded", color: "badge-secondary" },
      frozen: { label: "Frozen", color: "badge-neutral" },
    };
    return statusMap[status] || { label: status, color: "badge-neutral" };
  }
</script>

<div class="flex h-full w-full">
  <aside
    class="w-80 h-full bg-base-100 px-4 py-2 flex flex-col border-r border-base-300 bg-base-200"
  >
    <div class="flex flex-col gap-4 flex-1 min-h-0">
      <h2 class="font-semibold text-center border-b border-base-300 pb-2">
        Rooms
      </h2>

      <!-- Filters -->
      <div class="p-4 border-b border-base-300">
        <div class="flex flex-wrap gap-2">
          {#each ROOM_STATUSES as type}
            {@const count = sortedRooms.filter(
              (room) => room.status === type.value
            ).length}
            {#if count > 0}
              <button
                class="btn btn-xs"
                class:btn-primary={selectedTypes.has(type.value)}
                class:btn-outline={!selectedTypes.has(type.value)}
                onclick={() => toggleTypeFilter(type.value)}
              >
                {type.label}
                <span class="badge badge-xs ml-1">{count}</span>
              </button>
            {/if}
          {/each}

          {#if selectedTypes.size > 0}
            <button
              class="btn btn-xs btn-ghost"
              onclick={() => (selectedTypes = new Set())}
            >
              Clear
            </button>
          {/if}
        </div>
      </div>

      <!-- Room List -->
      <div
        class="flex-1 overflow-y-auto scroll-smooth"
        bind:this={roomListElement}
        style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch;"
      >
        {#if sortedRooms.length === 0}
          <div
            class="flex flex-col items-center justify-center p-8 text-center"
          >
            <div class="text-4xl mb-2">💬</div>
            <p class="text-base-content/70">
              {selectedTypes.size > 0
                ? "No rooms match your filters"
                : "No rooms available"}
            </p>
            {#if selectedTypes.size > 0}
              <button
                class="btn btn-sm btn-outline mt-2"
                onclick={() => (selectedTypes = new Set())}
              >
                Clear filters
              </button>
            {/if}
          </div>
        {:else}
          {#each sortedRooms as room}
            {@const statusInfo = getStatusInfo(room.status)}
            {@const isActive = selectedRoom?.id === room.id}
            <button
              class="w-full p-3 hover:bg-base-200 transition-colors border-b border-base-200 last:border-b-0 relative hover:cursor-pointer"
              class:border-l-4={isActive}
              class:border-l-primary={isActive}
              onclick={() => handleRoomClick(room)}
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <!-- Status indicator -->
                  <div class="flex-shrink-0">
                    <span class="badge badge-xs {statusInfo.color}"></span>
                  </div>

                  <!-- Room info -->
                  <div class="min-w-0 flex-1">
                    <div
                      class="font-medium text-sm truncate"
                      class:text-primary={isActive}
                    >
                      {room.id.length > 8
                        ? room.id.substring(0, 8) + "..."
                        : room.id}
                    </div>
                    <div
                      class="text-xs truncate"
                      class:text-primary={isActive}
                      class:text-base-content={!isActive}
                    >
                      {statusInfo.label}
                    </div>
                  </div>
                </div>

                <!-- Status badge -->
                <div class="flex-shrink-0">
                  <span class="badge badge-xs {statusInfo.color}">
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <!-- Active indicator -->
              {#if isActive}
                <div class="absolute right-2 top-1/2 -translate-y-1/2">
                  <div class="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              {/if}
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </aside>

  <!-- Main Content Area -->
  {#if sortedRooms.length > 0}
    <div class="flex flex-col flex-1 min-w-0">
      <header class="flex-shrink-0">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Chat</h1>
        </div>
      </header>

      <main
        class="flex-1 overflow-hidden w-full md:w-4xl max-w-4xl mx-auto border-x border-base-300"
      >
        <Messages
          class="px-12 py-4"
          {messages}
          operators={user ? [user] : []}
          agents={integrationAgents}
          {sender}
        />
      </main>

      <footer class="flex-shrink-0">
        <Interactions {sender} room={selectedRoom!} />
      </footer>
    </div>
  {:else}
    <div
      class="flex flex-col items-center justify-center p-8 text-center w-full h-full"
    >
      <div class="text-4xl mb-2">💬</div>
      <p class="text-base-content/70">No rooms available</p>
    </div>
  {/if}
</div>
