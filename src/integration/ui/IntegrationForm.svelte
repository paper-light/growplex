<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { X, Eye } from "@lucide/svelte";

  import { pb } from "@/shared/lib/pb";
  import type { IntegrationsResponse } from "@/shared/models/pocketbase-types";
  import { agentsProvider } from "@/agent/providers/agents.svelte";
  import { chatsProvider } from "@/chat/providers/chats.svelte";
  import { sourcesProvider } from "@/source/providers/sources.svelte";
  import { settingsProvider } from "@/user/settings.svelte";

  import Button from "@/shared/ui/Button.svelte";
  import Input from "@/shared/ui/Input.svelte";
  import Select from "@/shared/ui/Select.svelte";
  import Thalia from "@/shared/assets/Thalia.jpg";
  import Modal from "@/shared/ui/Modal.svelte";
  import Preview from "@/chat/ui/widgets/Preview.svelte";

  interface Props {
    integration: IntegrationsResponse | null;
    class?: ClassValue;
    onSaveSuccess?: (integration: IntegrationsResponse) => void;
    onSaveError?: (error: unknown) => void;
    onCancel?: () => void;
  }

  const {
    integration,
    class: className,
    onSaveSuccess,
    onSaveError,
    onCancel,
  }: Props = $props();

  let previewOpen = $state(false);

  // Form state
  let formName = $state("");
  let formAgents = $state<string[]>([]);
  let formSources = $state<string[]>([]);
  let formChats = $state<string[]>([]);

  // Preview state for new entities
  let previewAgents = $state<string[]>([]);
  let previewSources = $state<string[]>([]);
  let previewChats = $state<string[]>([]);

  // Loading state
  let saving = $state(false);

  // Get data from providers
  const agents = $derived(agentsProvider.agents);
  const chats = $derived(chatsProvider.chats);
  const sources = $derived(sourcesProvider.sources);

  // Available entities for selection
  const availableAgents = $derived(
    agents.filter(
      (agent) =>
        !formAgents.includes(agent.id) && !previewAgents.includes(agent.id)
    )
  );
  const availableSources = $derived(
    sources.filter(
      (source) =>
        !formSources.includes(source.id) && !previewSources.includes(source.id)
    )
  );
  const availableChats = $derived(
    chats.filter(
      (chat) =>
        !chat.integration &&
        !formChats.includes(chat.id) &&
        !previewChats.includes(chat.id)
    )
  );

  // Form dirty detection
  const isFormDirty = $derived(
    formName !== integration?.name ||
      JSON.stringify(formAgents) !==
        JSON.stringify(integration?.agents || []) ||
      JSON.stringify(formSources) !==
        JSON.stringify(integration?.sources || []) ||
      previewAgents.length > 0 ||
      previewSources.length > 0 ||
      previewChats.length > 0
  );

  // Initialize form when integration changes
  $effect(() => {
    if (integration) {
      formName = integration.name || "";
      formAgents = [...(integration.agents || [])];
      formSources = [...(integration.sources || [])];
      formChats = chats
        .filter((chat) => chat.integration === integration.id)
        .map((chat) => chat.id);
      previewAgents = [];
      previewSources = [];
      previewChats = [];
    }
  });

  // Helper function to get avatar URL
  const getAvatarUrl = (record: any) => {
    if (record?.avatar) {
      return pb.files.getURL(record, record.avatar);
    }
    return Thalia.src;
  };

  // Get entities for display (current + preview)
  const getDisplayAgents = () => {
    const currentAgents = agents.filter((agent) =>
      formAgents.includes(agent.id)
    );
    const previewAgentObjects = agents.filter((agent) =>
      previewAgents.includes(agent.id)
    );
    return [...currentAgents, ...previewAgentObjects];
  };

  const getDisplaySources = () => {
    const currentSources = sources.filter((source) =>
      formSources.includes(source.id)
    );
    const previewSourceObjects = sources.filter((source) =>
      previewSources.includes(source.id)
    );
    return [...currentSources, ...previewSourceObjects];
  };

  const getDisplayChats = () => {
    const currentChats = chats.filter((chat) => formChats.includes(chat.id));
    const previewChatObjects = chats.filter((chat) =>
      previewChats.includes(chat.id)
    );
    return [...currentChats, ...previewChatObjects];
  };

  // Action handlers
  function unlinkAgent(agentId: string) {
    formAgents = formAgents.filter((id) => id !== agentId);
    previewAgents = previewAgents.filter((id) => id !== agentId);
  }

  function unlinkSource(sourceId: string) {
    formSources = formSources.filter((id) => id !== sourceId);
    previewSources = previewSources.filter((id) => id !== sourceId);
  }

  function unlinkChat(chatId: string) {
    formChats = formChats.filter((id) => id !== chatId);
    previewChats = previewChats.filter((id) => id !== chatId);
  }

  function addAgent(agentId: string) {
    previewAgents = [...previewAgents, agentId];
  }

  function addSource(sourceId: string) {
    previewSources = [...previewSources, sourceId];
  }

  function addChat(chatId: string) {
    previewChats = [...previewChats, chatId];
  }

  // Check if entity is preview (newly added)
  function isPreviewAgent(agentId: string) {
    return previewAgents.includes(agentId);
  }

  function isPreviewSource(sourceId: string) {
    return previewSources.includes(sourceId);
  }

  function isPreviewChat(chatId: string) {
    return previewChats.includes(chatId);
  }

  // Preview function
  function previewChat(chatId: string) {
    if (integration) {
      settingsProvider.selectIntegrationChat(chatId);
      previewOpen = true;
    }
  }

  async function saveIntegration(e: Event) {
    e.preventDefault();
    if (!integration) return;

    saving = true;

    try {
      // Calculate entities to add and remove
      const originalAgents = integration.agents || [];
      const originalSources = integration.sources || [];
      const originalChats = chats
        .filter((chat) => chat.integration === integration.id)
        .map((chat) => chat.id);

      const agentsToAdd = previewAgents;
      const agentsToRemove = originalAgents.filter(
        (id) => !formAgents.includes(id)
      );
      const sourcesToAdd = previewSources;
      const sourcesToRemove = originalSources.filter(
        (id) => !formSources.includes(id)
      );
      const chatsToAdd = previewChats;
      const chatsToRemove = originalChats.filter(
        (id) => !formChats.includes(id)
      );

      // Update integration with proper PocketBase syntax
      const updateData: any = {
        name: formName,
      };

      // Add new agents
      if (agentsToAdd.length > 0) {
        updateData["agents+"] = agentsToAdd;
      }

      // Remove agents
      if (agentsToRemove.length > 0) {
        updateData["agents-"] = agentsToRemove;
      }

      // Add new sources
      if (sourcesToAdd.length > 0) {
        updateData["sources+"] = sourcesToAdd;
      }

      // Remove sources
      if (sourcesToRemove.length > 0) {
        updateData["sources-"] = sourcesToRemove;
      }

      const updatedIntegration = await pb
        .collection("integrations")
        .update(integration.id, updateData);

      // Update chats
      for (const chatId of chatsToAdd) {
        await pb.collection("chats").update(chatId, {
          integration: integration.id,
        });
      }

      // Unlink chats that were removed
      for (const chatId of chatsToRemove) {
        await pb.collection("chats").update(chatId, {
          integration: "",
        });
      }

      onSaveSuccess?.(updatedIntegration);
    } catch (error) {
      console.error("Failed to save integration:", error);
      onSaveError?.(error);
    } finally {
      saving = false;
    }
  }

  function handleCancel() {
    if (isFormDirty) {
      // Show confirmation dialog or handle dirty state
      if (
        confirm(
          "You have unsaved changes. Are you sure you want to discard them?"
        )
      ) {
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  }
</script>

<div class={className}>
  <form class="w-full h-full flex flex-col" onsubmit={saveIntegration}>
    <header
      class="flex items-center justify-between p-4 border-b border-base-300"
    >
      <Input
        size="lg"
        placeholder="Integration name"
        bind:value={formName}
        class="w-64"
      />
      <div class="flex items-center gap-2">
        <Button
          type="button"
          color="neutral"
          style="outline"
          onclick={handleCancel}
        >
          Cancel
        </Button>
        <Button type="submit" color="primary" disabled={!isFormDirty || saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </header>

    <div class="flex-1 flex min-h-0 p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <!-- Agents Section -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex items-center justify-between mb-4">
              <h3 class="card-title">Agents</h3>
            </div>
            <div class="space-y-2">
              {#each getDisplayAgents() as agent}
                <div
                  class="relative flex items-center gap-3 p-3 bg-base-300 rounded-lg {isPreviewAgent(
                    agent.id
                  )
                    ? 'opacity-60'
                    : ''}"
                >
                  <div class="avatar">
                    <div class="size-10 rounded-lg">
                      <img
                        src={getAvatarUrl(agent)}
                        alt="Agent avatar"
                        class="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium">
                      {agent.name || `Agent ${agent.id?.slice(0, 4) || "N/A"}`}
                    </p>
                    <p class="text-sm text-base-content/70"></p>
                  </div>
                  <button
                    type="button"
                    onclick={() => unlinkAgent(agent.id)}
                    class="btn btn-ghost btn-sm btn-square"
                  >
                    <X class="size-4" />
                  </button>
                </div>
              {/each}
              {#if availableAgents.length > 0 && formAgents.length + previewAgents.length < 1}
                <Select
                  class="w-full"
                  options={availableAgents.map((agent) => ({
                    value: agent.id,
                    label: agent.name || `Agent ${agent.id.slice(0, 4)}`,
                  }))}
                  onchange={(e) => addAgent((e.target as any).value)}
                >
                  Add agent...
                </Select>
              {/if}
              {#if getDisplayAgents().length === 0}
                <p class="text-base-content/50">No agents assigned</p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Chats Section -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex items-center justify-between mb-4">
              <h3 class="card-title">Chats</h3>
            </div>
            <div class="space-y-2">
              {#each getDisplayChats() as chat}
                <div
                  class="relative flex items-center gap-1 p-3 bg-base-300 rounded-lg {isPreviewChat(
                    chat.id
                  )
                    ? 'opacity-60'
                    : ''}"
                >
                  <div class="avatar">
                    <div class="size-10 rounded-lg">
                      <img
                        src={getAvatarUrl(chat)}
                        alt="Chat avatar"
                        class="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium">
                      {chat.name || `Chat ${chat.id?.slice(0, 4) || "N/A"}`}
                    </p>
                    <p class="text-sm text-base-content/70">
                      {chat.type || "No type"}
                    </p>
                  </div>
                  {#if chat.domain}
                    <div class="absolute top-2 right-10">
                      <span class="badge badge-sm badge-primary">
                        {chat.domain}
                      </span>
                    </div>
                  {/if}
                  <button
                    type="button"
                    onclick={() => unlinkChat(chat.id)}
                    class="btn btn-ghost btn-sm btn-square"
                  >
                    <X class="size-4" />
                  </button>
                  <button
                    type="button"
                    onclick={() => previewChat(chat.id)}
                    class="btn btn-ghost btn-sm btn-square"
                  >
                    <Eye class="size-4" />
                  </button>
                </div>
              {/each}
              {#if availableChats.length > 0}
                <Select
                  class="w-full"
                  options={availableChats.map((chat) => ({
                    value: chat.id,
                    label: chat.name || `Chat ${chat.id.slice(0, 4)}`,
                  }))}
                  onchange={(e) => addChat((e.target as any).value)}
                >
                  Add chat...
                </Select>
              {/if}
              {#if getDisplayChats().length === 0}
                <p class="text-base-content/50">No chats assigned</p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Sources Section -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex items-center justify-between mb-4">
              <h3 class="card-title">Sources</h3>
            </div>
            <div class="space-y-2">
              {#each getDisplaySources() as source}
                <div
                  class="relative flex items-center gap-3 p-3 bg-base-300 rounded-lg {isPreviewSource(
                    source.id
                  )
                    ? 'opacity-60'
                    : ''}"
                >
                  <div class="flex-1">
                    <p class="font-medium">
                      {source.name ||
                        `Source ${source.id?.slice(0, 4) || "N/A"}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onclick={() => unlinkSource(source.id)}
                    class="btn btn-ghost btn-sm btn-square"
                  >
                    <X class="size-4" />
                  </button>
                </div>
              {/each}
              {#if availableSources.length > 0}
                <Select
                  class="w-full"
                  options={availableSources.map((source) => ({
                    value: source.id,
                    label: source.name || `Source ${source.id.slice(0, 4)}`,
                  }))}
                  onchange={(e) => addSource((e.target as any).value)}
                >
                  Add source...
                </Select>
              {/if}
              {#if getDisplaySources().length === 0}
                <p class="text-base-content/50">No sources assigned</p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>

<Modal
  class="w-[400px] h-full"
  open={previewOpen}
  placement="right"
  onclose={() => (previewOpen = false)}
  noPadding
  backdrop
>
  <Preview />
</Modal>
