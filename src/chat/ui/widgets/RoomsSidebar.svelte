<script lang="ts">
  import { navigate } from "astro:transitions/client";

  import { settingsProvider } from "../../../user/settings.svelte";
  import { userProvider } from "../../../user/user.svelte";
  import type { RoomsResponse } from "../../../shared/models/pocketbase-types";
  import { roomsProvider } from "../../provider/rooms.svelte";

  const roomTypes = [
    { value: "operator", label: "Operator", color: "success" },
    { value: "waitingOperator", label: "Waiting", color: "warning" },
    { value: "auto", label: "Auto", color: "info" },
    { value: "seeded", label: "Seeded", color: "secondary" },
  ];

  const integrations = $derived(userProvider.integrations || []);
  const currentIntegration = $derived(userProvider.integration);

  const rooms = $derived(roomsProvider.rooms);
  const filteredRooms = $derived.by(() => {
    if (!rooms.length) return [];

    let filtered = rooms.filter((r) => r.status !== "preview");
    if (selectedTypes.size > 0)
      filtered = filtered.filter((room) => selectedTypes.has(room.status));

    return filtered.sort(sortRooms);
  });

  let selectedTypes = $state<Set<string>>(new Set());

  let roomListElement: HTMLDivElement | null = $state(null);
  let scrollPosition = $state(0);

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

  function sortRooms(a: RoomsResponse, b: RoomsResponse) {
    const order = {
      operator: 0,
      waitingOperator: 1,
      auto: 2,
      seeded: 3,
      frozen: 4,
      preview: 5,
    };
    return (order[a.status] ?? 99) - (order[b.status] ?? 99);
  }

  async function handleRoomClick(room: RoomsResponse) {
    saveScrollPosition();
    settingsProvider.setRoom(room.id);
    navigate(`/app/chat`);
  }

  async function handleIntegrationChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    settingsProvider.setIntegration(target.value);
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

  function formatRoomId(id: string) {
    return id.length > 8 ? id.substring(0, 8) + "..." : id;
  }
</script>

<div class="flex flex-col h-full w-80 bg-base-100 border-r border-base-300">
  <!-- Header -->
  <div class="p-4 border-b border-base-300">
    <!-- Integration Select -->
    <div class="form-control w-full">
      <label for="integration-select" class="label">
        <span class="label-text font-medium text-sm">Integration</span>
      </label>
      <select
        id="integration-select"
        class="select select-bordered w-full"
        value={currentIntegration?.id}
        onchange={handleIntegrationChange}
      >
        {#each integrations as integration}
          <option
            value={integration.id}
            selected={integration.id === currentIntegration?.id}
          >
            {integration.name}
          </option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Filters -->
  <div class="p-4 border-b border-base-300">
    <div class="flex flex-wrap gap-2">
      {#each roomTypes as type}
        {@const count = rooms.filter(
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
    {#if filteredRooms.length === 0}
      <div class="flex flex-col items-center justify-center p-8 text-center">
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
      {#each filteredRooms as room}
        {@const statusInfo = getStatusInfo(room.status)}
        {@const isActive = roomsProvider.room?.id === room.id}
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
                  {formatRoomId(room.id)}
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
