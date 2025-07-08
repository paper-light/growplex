<script lang="ts">
  import { Edit, X } from "@lucide/svelte";
  import { authProvider } from "../auth/auth.svelte";
  import { pb } from "../../shared/pb";
  import { settingsProvider } from "../settings/settings.svelte";
  import CreateAgentForm from "../agent/CreateAgentForm.svelte";
  import CreateChatForm from "../chat/CreateChatForm.svelte";
  import EditAgentForm from "../agent/EditAgentForm.svelte";
  import EditChatForm from "../chat/EditChatForm.svelte";
  import { portal } from "../../shared/actions/portal";

  interface Props {
    type: "agents" | "sources" | "chats" | "operators";
  }

  let { type }: Props = $props();

  const currentProject = $derived(settingsProvider.currentProject);
  const currentIntegration = $derived(settingsProvider.currentIntegration);

  const objects = $derived.by(() => {
    switch (type) {
      case "agents":
        return currentProject?.expand?.agents || [];
      case "sources":
        return currentProject?.expand?.sources || [];
      case "chats":
        return currentProject?.expand?.chats || [];
      default:
        return [];
    }
  });

  const currentObject = $derived.by(() => {
    switch (type) {
      case "agents":
        return objects?.find((o) => o.id === currentIntegration?.agent);

      case "sources":
        return objects?.filter((o) =>
          currentIntegration?.sources.includes(o.id)
        );

      case "chats":
        return objects?.find((o) => o.id === currentIntegration?.chat);
    }
  });

  let selectOpen = $state(false);
  let selectedId = $state("");
  let selectedIds: string[] = $state([]);

  let editModalOpen = $state(false);
  function openEdit() {
    editModalOpen = true;
  }
  function closeEdit() {
    editModalOpen = false;
  }

  function openSelect() {
    selectOpen = true;
    selectedId = "";
  }

  async function confirmSelect() {
    if (!currentIntegration) return;
    if (type === "sources") {
      // update multiple selection and keep open
      await pb.collection("integrations").update(currentIntegration.id, {
        sources: selectedIds,
      });
    } else if (selectedId) {
      const data: Record<string, any> = {};
      if (type === "agents") data.agent = selectedId;
      if (type === "chats") data.chat = selectedId;
      await pb.collection("integrations").update(currentIntegration.id, data);
      selectOpen = false;
    }
    await authProvider.refreshUser();
  }

  function closeSelectModal() {
    selectOpen = false;
  }

  let createModalOpen = $state(false);
  function openCreate() {
    createModalOpen = true;
  }
  function closeCreate() {
    createModalOpen = false;
  }

  async function detachOne(id: string) {
    if (!currentIntegration) return;
    await pb.collection("integrations").update(currentIntegration.id, {
      "sources-": [id],
    });
    await authProvider.refreshUser();
  }

  async function detach() {
    if (!currentIntegration) return;
    if (type === "agents") {
      await pb
        .collection("integrations")
        .update(currentIntegration.id, { agent: null });
    } else if (type === "chats") {
      await pb
        .collection("integrations")
        .update(currentIntegration.id, { chat: null });
    }
    await authProvider.refreshUser();
  }
</script>

<div
  class="relative border border-base-300 rounded p-4 flex items-center justify-between"
>
  {#if !currentObject || (type === "sources" && (currentObject as any[]).length === 0)}
    <div class="flex flex-col w-full gap-4">
      <button
        onclick={openCreate}
        class="btn btn-lg btn-primary btn-outline flex-1 p-6"
      >
        + Create {type}
      </button>

      {#if objects.length > 0}
        <button
          onclick={openSelect}
          class="btn btn-lg btn-secondary btn-outline flex-1 p-6"
        >
          Select
        </button>
      {/if}
    </div>
  {:else if type === "sources"}
    <div class="flex flex-wrap gap-2">
      {#each currentObject as any[] as o}
        <span class="badge badge-outline flex items-center p-2">
          {o.name || o.id}
          <button
            class="ml-1 btn btn-ghost btn-xs p-1"
            onclick={() => detachOne(o.id)}
          >
            <X size={12} />
          </button>
        </span>
      {/each}
    </div>
  {:else}
    <div class="flex items-center justify-center w-full px-12">
      <span class="text-2xl font-semibold mr-auto">
        {type.slice(0, -1)}: {(currentObject as any)?.name}
      </span>
      <button class="btn btn-ghost btn-square p-1 mr-2" onclick={openEdit}>
        <Edit size={48} />
      </button>
      <button class="btn btn-ghost btn-square p-1" onclick={detach}>
        <X size={48} />
      </button>
    </div>
  {/if}
</div>

{#if createModalOpen}
  <div use:portal={"body"}>
    <input
      type="checkbox"
      class="modal-toggle"
      bind:checked={createModalOpen}
    />
    <div class="modal">
      <div class="modal-box relative">
        <button
          class="btn btn-sm btn-circle absolute right-2 top-2"
          onclick={closeCreate}
        >
          <X size={20} />
        </button>
        {#if type === "agents"}
          <CreateAgentForm onClose={closeCreate} />
        {:else if type === "sources"}
          <h3 class="font-bold text-lg">Create Knowledge Source</h3>
        {:else if type === "chats"}
          <CreateChatForm onClose={closeCreate} />
        {:else if type === "operators"}
          <h3 class="font-bold text-lg">Create Operator</h3>
        {/if}
        <!-- Render your specific creation form here -->
        <div class="mt-4">
          <!-- Form fields for {type} -->
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Edit Modal -->
{#if editModalOpen}
  <div use:portal={"body"}>
    <input type="checkbox" class="modal-toggle" bind:checked={editModalOpen} />
    <div class="modal">
      <div class="modal-box relative">
        <button
          class="btn btn-sm btn-circle absolute right-2 top-2"
          onclick={closeEdit}
        >
          <X size={20} />
        </button>
        {#if type === "agents"}
          <EditAgentForm onClose={closeEdit} entity={currentObject as any} />
        {:else if type === "chats"}
          <EditChatForm onClose={closeEdit} entity={currentObject as any} />
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Selection Modal -->
{#if selectOpen}
  <div use:portal={"body"}>
    <input type="checkbox" class="modal-toggle" bind:checked={selectOpen} />
    <div class="modal">
      <div class="modal-box relative">
        <button
          class="btn btn-sm btn-circle absolute right-2 top-2"
          onclick={closeSelectModal}
        >
          <X size={20} />
        </button>

        {#if type === "sources"}
          <h3 class="font-bold text-lg mb-4">Select Knowledge Sources</h3>
        {:else}
          <h3 class="font-bold text-lg mb-4">Select {type.slice(0, -1)}</h3>
        {/if}

        <div class="modal-body space-y-3 max-h-64 overflow-y-auto">
          {#if type === "sources"}
            {#each objects as o}
              <label class="flex items-center">
                <input
                  type="checkbox"
                  class="checkbox mr-2"
                  bind:group={selectedIds}
                  value={o.id}
                />
                {o.name || o.id}
              </label>
            {/each}
          {:else}
            <select
              class="select select-bordered w-full"
              bind:value={selectedId}
            >
              <option value="" disabled selected>Select {type}</option>
              {#each objects as o}
                <option value={o.id}>{o.name || o.id}</option>
              {/each}
            </select>
          {/if}
        </div>

        <div class="modal-action">
          <button class="btn btn-primary" onclick={confirmSelect}
            >Confirm</button
          >
        </div>
      </div>
    </div>
  </div>
{/if}
