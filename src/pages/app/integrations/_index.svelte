<script lang="ts">
  import type { RecordModel } from "pocketbase";
  import { Funnel, Trash2 } from "@lucide/svelte";

  import { integrationsProvider } from "@/integration/providers/integrations.svelte";
  import { agentsProvider } from "@/agent/providers/agents.svelte";
  import { chatsProvider } from "@/chat/providers/chats.svelte";
  import { sourcesProvider } from "@/source/providers/sources.svelte";

  import Button from "@/shared/ui/Button.svelte";
  import { settingsProvider } from "@/user/settings.svelte";
  import { projectsProvider } from "@/project/providers/projects.svelte";
  import CreateRecord from "@/shared/ui/features/CreateRecord.svelte";
  import Modal from "@/shared/ui/Modal.svelte";
  import DeleteRecord from "@/shared/ui/features/DeleteRecord.svelte";
  import Thalia from "@/shared/assets/Thalia.jpg";
  import { pb } from "@/shared/lib/pb";
  import IntegrationForm from "@/integration/ui/IntegrationForm.svelte";

  const project = $derived(projectsProvider.selectedProject);

  const integrations = $derived(integrationsProvider.integrations);
  const agents = $derived(agentsProvider.agents);
  const chats = $derived(chatsProvider.chats);
  const sources = $derived(sourcesProvider.sources);

  const selectedIntegration = $derived(
    integrationsProvider.selectedIntegration
  );

  let integrationId = $state("");
  const integration = $derived(
    integrations.find((i) => i.id === integrationId) || null
  );

  const filteredIntegrations = $derived(integrations);

  const sortedIntegrations = $derived(
    filteredIntegrations.toSorted((a, b) => {
      if (selectedIntegration?.id === a.id) return -1;
      if (selectedIntegration?.id === b.id) return 1;
      return 0;
    })
  );

  // Helper functions to get related entities with safe access
  const getIntegrationAgents = (integration: any) => {
    if (!integration?.agents || !Array.isArray(integration.agents)) return [];
    return agents.filter((agent) => integration.agents.includes(agent.id));
  };

  const getIntegrationChats = (integration: any) => {
    if (!integration?.id) return [];
    return chats.filter((chat) => chat.integration === integration.id);
  };

  const getIntegrationSources = (integration: any) => {
    if (!integration?.sources || !Array.isArray(integration.sources)) return [];
    return sources.filter((source) => integration.sources.includes(source.id));
  };

  // Helper function to get avatar URL
  const getAvatarUrl = (record: any) => {
    if (record?.avatar) {
      return pb.files.getURL(record, record.avatar);
    }
    return Thalia.src;
  };

  function handleSaveSuccess(updatedIntegration: any) {
    integrationId = "";
  }

  function handleSaveError(error: unknown) {
    console.error("Failed to save integration:", error);
  }

  function handleCancel() {
    integrationId = "";
  }
</script>

<div class="w-full h-full flex flex-col">
  <header class="px-4 py-2 border-b border-base-300 bg-base-100 space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="text-sm text-base-content/50">
          <p>{integrations.length}</p>
          <p>integrations</p>
        </div>
        <div class="text-sm text-base-content/50">
          <p>{agents.length}</p>
          <p>agents</p>
        </div>
        <div class="text-sm text-base-content/50">
          <p>{chats.length}</p>
          <p>chats</p>
        </div>
        <div class="text-sm text-base-content/50">
          <p>{sources.length}</p>
          <p>sources</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <CreateRecord
          size="lg"
          projectId={project?.id || ""}
          collection="integrations"
          onSuccess={(integration) => {
            if (integration?.id) {
              settingsProvider.selectIntegration(integration.id);
            }
          }}
        />
      </div>
    </div>

    <div class="hidden">
      <h2 class="font-semibold">Filters</h2>
      <div class="flex items-center gap-2">
        <Button size="sm" color="neutral" style="outline">
          <Funnel class="size-4" />
          <span>Filter</span>
        </Button>
      </div>
    </div>
  </header>

  <main class="flex-1 flex flex-col min-h-0 p-4">
    <div class="flex flex-col gap-4 flex-1 min-h-0">
      {#if integrations.length > 0}
        <div class="overflow-x-auto flex-1">
          <table class="table w-full">
            <thead class="sticky top-0 bg-base-100 z-10">
              <tr>
                <th class="w-64">Name</th>
                <th class="w-1/3">Agents</th>
                <th class="w-1/3">Chats</th>
                <th class="w-1/3">Sources</th>
                <th class="w-24">Actions</th>
              </tr>
            </thead>

            <tbody>
              {#each sortedIntegrations as integration}
                <tr
                  onclick={() => {
                    settingsProvider.selectIntegration(integration.id);
                    integrationId = integration.id;
                  }}
                  class={[
                    "hover cursor-pointer hover:bg-base-200 rounded-lg transition",
                    integration.id === selectedIntegration?.id &&
                      "bg-primary/20 hover:bg-primary/40",
                  ]}
                >
                  <td class="font-medium">
                    {integration.name ||
                      `Integration ${integration.id?.slice(0, 4) || "N/A"}`}
                  </td>
                  <td>
                    <div class="space-y-2">
                      {#each getIntegrationAgents(integration) as agent}
                        <div
                          class="flex items-center gap-3 p-2 bg-base-300 rounded-lg"
                        >
                          <div class="avatar">
                            <div class="size-8 rounded-lg">
                              <img
                                src={getAvatarUrl(agent)}
                                alt="Agent avatar"
                                class="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          </div>
                          <span class="text-sm font-medium">
                            {agent.name ||
                              `Agent ${agent.id?.slice(0, 4) || "N/A"}`}
                          </span>
                        </div>
                      {/each}
                      {#if getIntegrationAgents(integration).length === 0}
                        <div class="text-sm text-base-content/50 p-2">
                          No agents
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <div class="space-y-2">
                      {#each getIntegrationChats(integration) as chat}
                        <div
                          class="relative flex items-center gap-3 p-2 bg-base-300 rounded-lg"
                        >
                          <div class="avatar">
                            <div class="size-8 rounded-lg">
                              <img
                                src={getAvatarUrl(chat)}
                                alt="Chat avatar"
                                class="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          </div>
                          <span class="text-sm font-medium">
                            {chat.name ||
                              `Chat ${chat.id?.slice(0, 4) || "N/A"}`}
                          </span>
                          {#if chat.type}
                            <div class="absolute top-1 right-1">
                              <span class="badge badge-xs badge-primary">
                                {chat.type}
                              </span>
                            </div>
                          {/if}
                        </div>
                      {/each}
                      {#if getIntegrationChats(integration).length === 0}
                        <div class="text-sm text-base-content/50 p-2">
                          No chats
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <div class="space-y-2">
                      {#each getIntegrationSources(integration) as source}
                        <div class="p-2 bg-base-300 rounded-lg">
                          <span class="text-sm font-medium">
                            {source.name ||
                              `Source ${source.id?.slice(0, 4) || "N/A"}`}
                          </span>
                        </div>
                      {/each}
                      {#if getIntegrationSources(integration).length === 0}
                        <div class="text-sm text-base-content/50 p-2">
                          No sources
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <DeleteRecord
                        square
                        style="soft"
                        msg="Are you sure you want to delete this integration? All associated chats will be unlinked."
                        record={integration as RecordModel}
                        onSuccess={() => {
                          if (integrations.length > 0) {
                            settingsProvider.selectIntegration(
                              integrations[0].id
                            );
                          }
                        }}
                      >
                        <Trash2 class="size-5" />
                      </DeleteRecord>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div class="flex flex-col gap-2 p-4 text-center">
          <h2 class="text-lg font-bold">No integrations found</h2>
          <p class="text-base-content/70">
            Create your first integration to get started
          </p>
        </div>
      {/if}
    </div>
  </main>
</div>

<Modal
  class="w-full max-w-5xl h-full"
  open={!!integration}
  placement="left"
  onclose={handleCancel}
  backdrop
>
  <IntegrationForm
    class="h-full"
    {integration}
    onSaveSuccess={handleSaveSuccess}
    onSaveError={handleSaveError}
    onCancel={handleCancel}
  />
</Modal>
