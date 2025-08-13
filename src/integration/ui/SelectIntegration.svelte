<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Dropdown from "@/shared/ui/Dropdown.svelte";
  import { settingsProvider } from "@/user/settings.svelte";
  import { integrationsProvider } from "@/integration/providers/integrations.svelte";
  import { projectsProvider } from "@/control/providers/projects.svelte";
  import CreateRecord from "@/shared/ui/features/CreateRecord.svelte";

  interface Props {
    class?: ClassValue;
  }
  const { class: className }: Props = $props();

  let open = $state(false);

  const integrations = $derived(integrationsProvider.integrations);
  const selectedIntegrationId = $derived(
    integrationsProvider.selectedIntegration?.id
  );
  const selectedProjectId = $derived(projectsProvider.selectedProject?.id);
</script>

<div class={className}>
  <Dropdown
    bind:open
    class="w-42 border border-base-300 rounded-md"
    selected={selectedIntegrationId}
    options={integrations.map((p) => ({
      value: p.id,
      label: p.name,
    }))}
    onselect={(integrationId) => {
      settingsProvider.selectIntegration(integrationId);
      open = false;
    }}
  >
    {#snippet badge()}
      <span class="absolute left-0 -top-1 text-info font-semibold text-xs">
        integration
      </span>
    {/snippet}

    {#snippet actions()}
      <CreateRecord
        onSuccess={(record) => {
          settingsProvider.selectIntegration(record.id);
          open = false;
        }}
        collection="integrations"
        projectId={selectedProjectId}
      >
        + Create
      </CreateRecord>
    {/snippet}
  </Dropdown>
</div>
