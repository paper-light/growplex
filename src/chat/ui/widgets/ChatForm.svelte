<script lang="ts">
  import DomainConnect from "@/knowledge/ui/DomainConnect.svelte";

  import Card from "@/shared/ui/lib/Card.svelte";
  import SourceStatus from "@/knowledge/ui/SourceStatus.svelte";
  import { projectsProvider } from "@/control/providers/projects.svelte";
  import { integrationsProvider } from "@/integration/providers/integrations.svelte";
  import { sourcesProvider } from "@/knowledge/providers/sources.svelte";

  import { chatsProvider } from "@/chat/providers/chats.svelte";
  import ChatSelect from "@/chat/ui/features/crud/ChatSelect.svelte";
  import ChatAvatarUpdate from "@/chat/ui/features/crud/ChatAvatarUpdate.svelte";
  import ChatNameUpdate from "@/chat/ui/features/crud/ChatNameUpdate.svelte";
  import ChatDomainUpdate from "@/chat/ui/features/crud/ChatDomainUpdate.svelte";
  import ChatFirstMessageUpdate from "@/chat/ui/features/crud/ChatFirstMessageUpdate.svelte";
  import ThemeSelection from "@/chat/ui/features/crud/ThemeSelection.svelte";

  const project = $derived(projectsProvider.selectedProject);
  const integartion = $derived(integrationsProvider.selectedIntegration);
  const chat = $derived(chatsProvider.selectedIntegrationChat);

  const sources = $derived(
    sourcesProvider.sources.filter((s) => integartion?.sources?.includes(s.id))
  );
  const webSource = $derived(sources.find((s) => s.type === "web") || null);

  const domain = $derived(chat?.domain ?? "");
</script>

<Card title="Chat" class="space-y-4 max-w-2xl mx-auto">
  <div class="space-y-4">
    <ChatSelect />

    {#if chat}
      <div class="flex gap-6">
        <ChatAvatarUpdate {chat} class="flex-1 max-w-24" mode="action" />

        <div class="flex-1 space-y-2">
          <ChatNameUpdate {chat} />

          <ChatDomainUpdate {chat} disabled={!!webSource} />
          <DomainConnect
            projectId={project?.id || ""}
            {domain}
            integrationId={integartion?.id}
            disabled={!!webSource || !domain.trim()}
          />
          {#if webSource}
            <SourceStatus sourceId={webSource.id} />
          {/if}
        </div>
      </div>

      <ChatFirstMessageUpdate {chat} />
      <ThemeSelection {chat} />
    {/if}
  </div>
</Card>
