<script lang="ts">
  import { onMount } from "svelte";

  import Interactions from "@/chat/ui/widgets/Interactions.svelte";
  import Messages from "@/messages/ui/widgets/Messages.svelte";
  import { roomsProvider } from "@/chat/providers/rooms.svelte";
  import { socketProvider, type Sender } from "@/chat/providers/socket.svelte";
  import type { RoomsResponse } from "@/shared/models/pocketbase-types";
  import { settingsProvider } from "@/user/settings.svelte";
  import { userProvider } from "@/user/user.svelte";
  import { pb } from "@/shared/lib/pb";
  import Man from "@/shared/assets/Man.jpg";
  import { agentsProvider } from "@/agent/providers/agents.svelte";
  import CreateRecord from "@/shared/ui/features/CreateRecord.svelte";
  import { chatsProvider } from "@/chat/providers/chats.svelte";

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

  const innerChat = $derived(chatsProvider.innerChat);

  const integrationAgents = $derived(agentsProvider.integrationAgents);

  const rooms = $derived(roomsProvider.integrationRooms);
  const selectedRoom = $derived(roomsProvider.selectedRoom);

  const filteredRooms = $derived.by(() => {
    if (!rooms.length) return [];
    let filtered = rooms.filter(
      (r) => r.type === "oracle" && r.chat === innerChat?.id
    );
    return filtered;
  });
  const sortedRooms = $derived(filteredRooms);

  const messages = $derived.by(() => {
    if (!selectedRoom) return [];
    const history = socketProvider.histories.get(selectedRoom.id);
    return history || [];
  });

  // SCROLL AND HTML
  let sidebarScroll = $state<HTMLElement | null>(null);
  let roomListElement: HTMLDivElement | null = $state(null);
  let scrollPosition = $state(0);

  onMount(() => {
    if (!sortedRooms.find((r) => r.id === selectedRoom?.id)) {
      const room = sortedRooms[0];
      if (room) settingsProvider.selectRoom(room.id);
    }
  });

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
</script>

<div class="flex h-full w-full">
  <aside
    class="w-80 h-full bg-base-100 px-4 py-2 flex flex-col border-r border-base-300 bg-base-200"
  >
    <div class="flex flex-col gap-4 flex-1 min-h-0">
      <div
        class="flex items-center justify-center border-b border-base-300 pb-2"
      >
        <CreateRecord
          block
          collection="rooms"
          data={{
            type: "oracle",
            status: "auto",
            chat: innerChat?.id,
          }}
          onSuccess={(room) => {
            settingsProvider.selectRoom(room.id);
          }}
        >
          + Create room
        </CreateRecord>
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
            <p class="text-base-content/70">No oracle rooms available</p>
          </div>
        {:else}
          {#each sortedRooms as room}
            {@const isActive = selectedRoom?.id === room.id}
            <button
              class="w-full p-3 hover:bg-base-200 transition-colors border-b border-base-200 last:border-b-0 relative hover:cursor-pointer"
              class:border-l-4={isActive}
              class:border-l-primary={isActive}
              onclick={() => handleRoomClick(room)}
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 min-w-0 flex-1">
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
                  </div>
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
  {#if innerChat && sortedRooms.length > 0}
    <div
      class="flex flex-col flex-1 min-w-0 md:w-4xl max-w-4xl mx-auto border-x border-base-100"
    >
      <header class="flex-shrink-0">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Chat</h1>
        </div>
      </header>

      <main class="flex-1 overflow-hidden w-full">
        <Messages
          class="px-12 py-4"
          {messages}
          operators={user ? [user] : []}
          agents={integrationAgents}
          {sender}
          chat={innerChat}
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
      <p class="text-base-content/70">No oracle rooms available</p>
      <CreateRecord
        collection="rooms"
        data={{
          type: "oracle",
          status: "auto",
          chat: innerChat?.id,
        }}
        onSuccess={(room) => {
          settingsProvider.selectRoom(room.id);
        }}
      >
        Create first and start working!
      </CreateRecord>
    </div>
  {/if}
</div>
