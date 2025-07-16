<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { X, Check, Edit, Trash2 } from "@lucide/svelte";

  import { uiProvider } from "../user/ui.svelte";
  import { settingsProvider } from "../user/settings.svelte";
  import { userProvider } from "../user/user.svelte";

  interface Props {
    block?: boolean;
  }

  let { block = false }: Props = $props();

  const currentProject = $derived(userProvider.project);
  const currentIntegration = $derived(userProvider.integration);
  const integrations = $derived(currentProject?.expand?.integrations || []);

  const open = $derived(uiProvider.integrationsSidebarOpen);
  let sidebarEl: HTMLElement | null = $state(null);

  let creatingIntegrations = $state<{ id: string; name: string }[]>([]);
  let editingIntegrationId = $state<string | null>(null);
  let editedIntegrationName = $state<string>("");

  let showDeleteModal = $state(false);
  let integrationToDeleteId = $state<string | null>(null);

  function openSidebar() {
    uiProvider.setIntegrationsSidebarOpen(true);
  }
  function closeSidebar() {
    uiProvider.setIntegrationsSidebarOpen(false);
  }
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") closeSidebar();
  }

  $effect(() => {
    if (open && !block) window.addEventListener("keydown", handleKeydown);
    else window.removeEventListener("keydown", handleKeydown);
  });

  onMount(() => {
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  function addCreatingIntegration() {
    creatingIntegrations.push({ id: String(Date.now()), name: "" });
  }
  async function confirmCreate(ci: { id: string; name: string }) {
    if (!currentProject || !ci.name.trim()) return;
    const newInt = await userProvider.createIntegration({
      name: ci.name,
      project: currentProject.id,
    });

    creatingIntegrations = creatingIntegrations.filter((i) => i.id !== ci.id);
    settingsProvider.setIntegration(newInt.id);
  }

  function startEditIntegration(e: MouseEvent, integrationId: string) {
    e.stopPropagation();
    editingIntegrationId = integrationId;
    editedIntegrationName =
      integrations.find((i) => i.id === integrationId)?.name || "";
  }
  function cancelEditIntegration(e: MouseEvent) {
    e.stopPropagation();
    editingIntegrationId = null;
    editedIntegrationName = "";
  }
  async function confirmEditIntegration(e: MouseEvent, integrationId: string) {
    e.stopPropagation();
    if (!editedIntegrationName.trim()) return;
    await userProvider.updateIntegration(integrationId, {
      name: editedIntegrationName.trim(),
    });
    settingsProvider.setIntegration(integrationId);
    editingIntegrationId = null;
    editedIntegrationName = "";
  }

  function openDeleteModal(e: MouseEvent, integrationId: string) {
    e.stopPropagation();
    integrationToDeleteId = integrationId;
    showDeleteModal = true;
  }
  function closeDeleteModal() {
    showDeleteModal = false;
    integrationToDeleteId = null;
  }
  async function confirmDeleteIntegration() {
    if (!integrationToDeleteId) return;
    await userProvider.deleteIntegration(integrationToDeleteId);
    showDeleteModal = false;
    integrationToDeleteId = null;
  }
</script>

{#if !block}
  {#if !open}
    <button
      type="button"
      class="absolute top-1/2 -left-1 -translate-y-1/2 rounded-full bg-primary hover:bg-base-200 transition border border-primary hover:cursor-pointer hover:text-primary z-40 flex flex-col items-center justify-center px-2 py-3"
      aria-label="Open sidebar"
      onclick={openSidebar}
      style="height: 280px; min-width: 30px;"
    >
      {#each "INTEGRATIONS".split("") as letter, i}
        <span class="block text-sm font-bold" style="transform: rotate(90deg);"
          >{letter}</span
        >
      {/each}
    </button>
  {:else}
    <button
      type="button"
      class="absolute top-1/2 -left-1 -translate-y-1/2 rounded-full bg-primary hover:bg-base-200 transition border border-primary hover:cursor-pointer hover:text-primary z-40"
      aria-label="Close sidebar"
      onclick={closeSidebar}
    >
      <X size={32} />
    </button>
  {/if}
{/if}

{#if open || block}
  <aside
    bind:this={sidebarEl}
    class={[
      "bg-base-200 shadow-xl flex flex-col px-2 pt-10",
      block ? "w-full h-full min-h-0" : "fixed top-0 left-0 w-80 z-30 h-full",
    ]}
    transition:slide={!block ? { axis: "x" } : undefined}
    aria-label="Integration sidebar"
    tabindex="-1"
    style={block ? "height: 100%; max-height: 100%;" : undefined}
    onintroend={() => sidebarEl?.focus()}
  >
    {#if !block}
      <button
        type="button"
        class="btn btn-sm btn-ghost btn-circle absolute top-4 right-4"
        aria-label="Close sidebar"
        onclick={closeSidebar}
      >
        <X size={20} />
      </button>
    {/if}

    <!-- Scrollable list -->
    <div class="flex-1 min-h-0 overflow-y-auto mt-2">
      <ul class="p-0 space-y-1">
        {#each integrations as integration (integration.id)}
          <li class="p-1 pr-2">
            {#if editingIntegrationId === integration.id}
              <div class="flex items-center gap-2">
                <input
                  class="input input-bordered flex-1"
                  type="text"
                  bind:value={editedIntegrationName}
                  onclick={(e) => e.stopPropagation()}
                />
                <button
                  onclick={(e) => confirmEditIntegration(e, integration.id)}
                  class="btn btn-ghost btn-xs p-1"
                >
                  <Check size={12} />
                </button>
                <button
                  onclick={cancelEditIntegration}
                  class="btn btn-ghost btn-xs p-1"
                >
                  <X size={12} />
                </button>
              </div>
            {:else}
              <div class="flex items-center justify-between gap-2">
                <button
                  class="flex-1 text-left btn btn-block btn-ghost hover:bg-base-300 truncate p-1"
                  class:text-primary={integration.id === currentIntegration?.id}
                  onclick={() =>
                    settingsProvider.setIntegration(integration.id)}
                >
                  {integration.name}
                </button>
                <button
                  onclick={(e) => startEditIntegration(e, integration.id)}
                  class="btn btn-ghost btn-xs p-1"
                >
                  <Edit size={12} />
                </button>
                <button
                  onclick={(e) => openDeleteModal(e, integration.id)}
                  class="btn btn-ghost btn-xs p-1 text-error"
                  aria-label="Delete integration"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </div>

    <!-- Fixed footer -->
    <div class="px-1 py-4 border-t flex-shrink-0">
      {#each creatingIntegrations as ci (ci.id)}
        <div class="flex items-center gap-2 mb-2">
          <input
            class="input input-bordered flex-1"
            type="text"
            placeholder="New integration name"
            bind:value={ci.name}
          />
          <button
            onclick={() => confirmCreate(ci)}
            class="btn btn-ghost btn-xs p-1"
          >
            <Check size={12} />
          </button>
          <button
            onclick={() =>
              (creatingIntegrations = creatingIntegrations.filter(
                (i) => i.id !== ci.id
              ))}
            class="btn btn-ghost btn-xs p-1 text-error"
            aria-label="Cancel creating integration"
          >
            <X size={12} />
          </button>
        </div>
      {/each}
      <button
        class="btn btn-block btn-primary btn-outline p-1"
        onclick={addCreatingIntegration}
      >
        + Create Integration
      </button>
    </div>
  </aside>
{/if}

{#if showDeleteModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div
      class="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col items-center"
    >
      <div class="text-lg font-semibold mb-4">Are you sure?</div>
      <div class="flex gap-2 w-full justify-center">
        <button class="btn btn-error btn-sm" onclick={confirmDeleteIntegration}
          >Yes, delete</button
        >
        <button class="btn btn-ghost btn-sm" onclick={closeDeleteModal}
          >Cancel</button
        >
      </div>
    </div>
  </div>
{/if}
