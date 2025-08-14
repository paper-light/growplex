<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import Dropdown from "@/shared/ui/Dropdown.svelte";
  import { settingsProvider } from "@/user/settings.svelte";
  import { integrationsProvider } from "@/integration/providers/integrations.svelte";
  import { projectsProvider } from "@/project/providers/projects.svelte";
  import CreateRecord from "@/shared/ui/features/CreateRecord.svelte";
  import Button from "@/shared/ui/Button.svelte";
  import Modal from "@/shared/ui/Modal.svelte";
  import type { IntegrationsResponse } from "@/shared/models/pocketbase-types";

  import IntegrationForm from "./IntegrationForm.svelte";

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

  let modalIntegration: IntegrationsResponse | null = $state(null);
</script>

<div class={className}>
  <Dropdown
    bind:open
    class="w-50 border border-base-300 rounded-md"
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

    {#snippet rowActions(integrationId, isSelected)}
      <Button
        square
        size="sm"
        color={isSelected ? "primary" : "neutral"}
        style="ghost"
        onclick={() => {
          modalIntegration =
            integrations.find((i) => i.id === integrationId) || null;
        }}
      >
        <Pencil size={14} />
      </Button>
    {/snippet}

    {#snippet endActions()}
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

<Modal
  class="w-full max-w-5xl h-full"
  open={!!modalIntegration}
  placement="left"
  onclose={() => (modalIntegration = null)}
  backdrop
>
  <IntegrationForm
    class="h-full"
    integration={modalIntegration}
    onSaveSuccess={() => (modalIntegration = null)}
    onSaveError={() => (modalIntegration = null)}
    onCancel={() => (modalIntegration = null)}
  />
</Modal>
