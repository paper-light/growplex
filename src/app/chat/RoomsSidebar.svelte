<script lang="ts">
  import z from "zod";
  import { chatProvider } from "./chat.svelte";
  import { settingsProvider } from "../settings/settings.svelte";
  import { navigate } from "astro:transitions/client";
  import { ChatRoomSchema } from "../../models";

  // Integrations
  const integrations = $derived(
    settingsProvider.currentProject?.expand!.integrations! || []
  );
  const currentIntegration = $derived(settingsProvider.currentIntegration);

  // Room type filters
  const roomTypes = [
    { value: "seeded", label: "Seeded" },
    { value: "auto", label: "Auto" },
    { value: "waitingOperator", label: "Waiting Operator" },
    { value: "operator", label: "Operator" },
  ];
  let activeType: string | null = $state(null);

  // Rooms
  const rooms = $derived.by(async () => {
    const rooms = await chatProvider.rooms;
    return rooms
      .filter((room) => room.status !== "preview")
      .sort(sortRooms)
      .filter((room) => !activeType || room.status === activeType);
  });

  // Sorting function
  function sortRooms(
    a: z.infer<typeof ChatRoomSchema>,
    b: z.infer<typeof ChatRoomSchema>
  ) {
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

  // Handle room click
  async function handleRoomClick(room: z.infer<typeof ChatRoomSchema>) {
    await chatProvider.setCurrentRoom(room.id);
    navigate(`/app/chat/${room.id}`);
  }

  // Handle integration change
  function handleIntegrationChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    settingsProvider.setCurrentIntegration(target.value);
  }
</script>

{#await chatProvider.currentRoom}
  <div class="flex items-center gap-2">
    <span>Loading...</span>
  </div>
{:then room}
  <div class="flex items-center gap-2">
    <span>{room?.id}-{room?.status}</span>
  </div>
{/await}

<div class="flex flex-col h-full w-64 bg-base-200 p-4 gap-4">
  <!-- Integration Select -->
  <select
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

  <!-- Room Type Filters -->
  <div class="flex gap-2">
    {#each roomTypes as type}
      <button
        class="btn btn-sm"
        class:selected={activeType === type.value}
        onclick={() =>
          (activeType = activeType === type.value ? null : type.value)}
      >
        {type.label}
      </button>
    {/each}
  </div>

  <!-- Room List -->
  <div class="flex-1 overflow-y-auto mt-2">
    {#await rooms}
      <div class="flex items-center gap-2">
        <span>Loading...</span>
      </div>
    {:then rooms}
      {#each rooms as room}
        <button
          class="btn btn-block justify-start mb-2"
          onclick={() => handleRoomClick(room)}
        >
          <span class="indicator mr-2">
            {#if room.status === "operator"}
              <span class="badge badge-success"></span>
            {:else if room.status === "auto"}
              <span class="badge badge-info"></span>
            {:else if room.status === "seeded"}
              <span class="badge badge-warning"></span>
            {:else}
              <span class="badge badge-neutral"></span>
            {/if}
          </span>
          <span>{room.id}-{room.status}</span>
        </button>
      {/each}
      {#if rooms.length === 0}
        <div class="text-center text-base-content/50 mt-8">No rooms</div>
      {/if}
    {:catch error}
      <div class="flex items-center gap-2">
        <span>Error: {error.message}</span>
      </div>
    {/await}
  </div>
</div>
