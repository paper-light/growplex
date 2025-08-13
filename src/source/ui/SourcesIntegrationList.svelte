<script lang="ts">
  import { projectsProvider } from "@/project/providers/projects.svelte";
  import { integrationsProvider } from "@/integration/providers/integrations.svelte";
  import { chatsProvider } from "@/chat/providers/chats.svelte";
  import Card from "@/shared/ui/Card.svelte";

  import { sourcesProvider } from "../providers/sources.svelte";
  import SourceStatus from "./SourceStatus.svelte";
  import DomainConnect from "./DomainConnect.svelte";

  const project = $derived(projectsProvider.selectedProject);

  const selectedIntegration = $derived(
    integrationsProvider.selectedIntegration
  );
  const sources = $derived(sourcesProvider.sources);
  const integrationSources = $derived(
    sources.filter((s) => selectedIntegration?.sources?.includes(s.id))
  );

  const chat = $derived(chatsProvider.selectedIntegrationChat);

  const domain = $derived(chat?.domain);
  const webDomain = $derived(
    sources.find(
      (s) =>
        s.metadata &&
        "domain" in (s.metadata as Record<string, unknown>) &&
        (s.metadata as Record<string, unknown>).domain === domain
    ) || null
  );
</script>

<Card title="Connected Knowledge">
  <div class="flex flex-col gap-4">
    {#each integrationSources as source}
      <SourceStatus sourceId={source.id} />
    {/each}

    {#if domain && !webDomain}
      <DomainConnect
        inputDisabled
        projectId={project?.id || ""}
        {domain}
        integrationId={selectedIntegration?.id}
        disabled={!domain.trim()}
      />
    {/if}
  </div>
</Card>
