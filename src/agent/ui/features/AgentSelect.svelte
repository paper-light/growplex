<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Select from "../../../shared/ui/lib/Select.svelte";
  import { agentsProvider } from "../../providers/agents.svelte";
  import { integrationsProvider } from "../../../integration/providers/integrations.svelte";
  import { integrationsCrud } from "../../../integration/repositories/integration-crud";
  import { settingsProvider } from "../../../user/settings.svelte";

  interface Props {
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }
  let { class: className = "", size = "md" }: Props = $props();

  const integration = $derived(integrationsProvider.selectedIntegration);
  const selectedAgent = $derived(agentsProvider.selectedIntegrationAgent);
  const allAgents = $derived(
    agentsProvider.agents?.filter(
      (a) => !integration?.agents.includes(a.id) || a.id === selectedAgent?.id
    ) || []
  );

  const agentId = $derived(selectedAgent?.id || "");

  const options = $derived(
    allAgents.map((agent) => ({
      value: agent.id,
      label: agent.name || agent.id,
    }))
  );

  async function onchange(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || !integration || !agentId) return;

    const updated = await integrationsCrud.update({
      id: integration.id,
      agents: [id],
    });

    settingsProvider.selectIntegrationAgent(id);

    console.log("integration", integration.agents);
    console.log("updated", updated.agents);
  }
</script>

{#if options.length > 0}
  <div class={className}>
    <Select value={agentId} {onchange} {options} {size} color="neutral" />
  </div>
{/if}
