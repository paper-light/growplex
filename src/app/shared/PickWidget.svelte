<script lang="ts">
    import { X } from "@lucide/svelte";
    import { authProvider, pb } from "../auth/auth.svelte";
    import { settingsProvider } from "../settings/settings.svelte";

    interface Props {
        type: 'agents' | 'knowledgeSources' | 'chats' | 'operators'
    }

    let {type}: Props = $props()

    const currentProject = $derived(settingsProvider.currentProject);
    const currentIntegration = $derived(settingsProvider.currentIntegration);

    const objects = $derived((() => {
        switch (type) {
            case "agents": 
                return currentProject?.expand?.agents || []
            case "knowledgeSources": 
                return currentProject?.expand?.knowledgeSources || []
            case "chats":
            return currentProject?.expand?.chats || []
            default: return []
        }
    })())

    const currentObject = $derived((() => {
        switch (type) {
            case "agents": {
                return objects?.find(o => o.id === currentIntegration?.agent)
            } case "knowledgeSources": {
                return objects?.filter(o => currentIntegration?.knowledgeSources.includes(o.id))
            } case "chats": {
                return objects?.find(o => o.id === currentIntegration?.chat)
            }
        }
    })())

    let selectOpen = $state(false);
    let selectedId = $state('');
    let selectedIds: string[] = $state([])

  function openSelect() {
    selectOpen = true;
    selectedId = '';
  }

  async function confirmSelect() {
    if (!currentIntegration) return;
    if (type === 'knowledgeSources') {
      // update multiple selection and keep open
      await pb.collection('integrations').update(currentIntegration.id, {
        knowledgeSources: selectedIds
      });
    } else if (selectedId) {
      const data: Record<string, any> = {};
      if (type === 'agents') data.agent = selectedId;
      if (type === 'chats') data.chat = selectedId;
      await pb.collection('integrations').update(currentIntegration.id, data);
      selectOpen = false;
    }
    await authProvider.refreshUser();
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
    await pb.collection('integrations').update(currentIntegration.id, {
      "knowledgeSources-": [id]
    });
    await authProvider.refreshUser();
  }

  async function detach() {
    if (!currentIntegration) return;
    if (type === 'agents') {
      await pb.collection('integrations').update(currentIntegration.id, { agent: null });
    } else if (type === 'chats') {
      await pb.collection('integrations').update(currentIntegration.id, { chat: null });
    }
    await authProvider.refreshUser();
  }
</script>

<div class="relative border border-base-300 rounded p-4 flex items-center justify-between">
    {#if !currentObject || (type === 'knowledgeSources' && (currentObject as any[]).length === 0)}
      <div class="space-x-2">
        <button class="btn btn-sm btn-primary btn-outline" onclick={openCreate}>
          + Create {type}
        </button>
        {#if objects.length > 0}
          <button class="btn btn-sm btn-secondary btn-outline" onclick={openSelect}>
            Select
          </button>
        {/if}
      </div>
    {:else}
      {#if type === 'knowledgeSources'}
        <div class="flex flex-wrap gap-2">
          {#each currentObject as any[] as o}
            <span class="badge badge-outline flex items-center p-2">
              {o.name || o.id}
              <button class="ml-1 btn btn-ghost btn-xs p-1" onclick={() => detachOne(o.id)}>
                <X size={12} />
              </button>
            </span>
          {/each}
        </div>
      {:else}
        <div class="flex items-center gap-2">
          <span>{(currentObject as any).id}</span>
          <button class="btn btn-ghost btn-sm" onclick={detach}>
            <X size={16} />
          </button>
        </div>
      {/if}
    {/if}
  </div>
  
  {#if selectOpen}
    <div class="absolute mt-2 left-0 w-full z-50">
      {#if type === 'knowledgeSources'}
        <div class="bg-base-100 border border-base-300 rounded p-2 shadow">
          {#each objects as o}
            <label class="inline-flex items-center w-full p-1">
              <input type="checkbox" class="checkbox mr-2" bind:group={selectedIds} value={o.id} />
              {o.name || o.id}
            </label>
          {/each}
          <button class="btn btn-sm btn-primary mt-2" onclick={confirmSelect}>
            Confirm
          </button>
        </div>
      {:else}
        <select class="select select-bordered w-full mb-2" bind:value={selectedId}>
          <option value="" disabled selected>Select {type}</option>
          {#each objects as o}
            <option value={o.id}>{o.name || o.id}</option>
          {/each}
        </select>
        <button class="btn btn-sm btn-primary" onclick={confirmSelect}>
          Confirm
        </button>
      {/if}
    </div>
  {/if}
  
  {#if createModalOpen}
    <input type="checkbox" class="modal-toggle" bind:checked={createModalOpen} />
    <div class="modal">
      <div class="modal-box relative">
        <button class="btn btn-sm btn-circle absolute right-2 top-2" onclick={closeCreate}>
          <X size={20} />
        </button>
        {#if type === 'agents'}
          <h3 class="font-bold text-lg">Create Agent</h3>
        {:else if type === 'knowledgeSources'}
          <h3 class="font-bold text-lg">Create Knowledge Source</h3>
        {:else if type === 'chats'}
          <h3 class="font-bold text-lg">Create Chat</h3>
        {:else if type === 'operators'}
          <h3 class="font-bold text-lg">Create Operator</h3>
        {/if}
        <!-- Render your specific creation form here -->
        <div class="mt-4">
          <!-- Form fields for {type} -->
        </div>
      </div>
    </div>
  {/if}