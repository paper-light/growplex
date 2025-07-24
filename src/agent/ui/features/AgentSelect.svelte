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
  const selectedIntegrationAgent = $derived(
    agentsProvider.selectedIntegrationAgent
  );
  const allAgents = $derived(agentsProvider.agents || []);

  const agentId = $derived(selectedIntegrationAgent?.id || "");

  const options = $derived.by(() => {
    return allAgents.map((agent) => ({
      value: agent.id,
      label: agent.name || agent.id,
    }));
  });

  async function onchange(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || !integration || !agentId) return;
    await integrationsCrud.update({
      id: integration.id,
      addAgents: [id],
      removeAgents: [agentId],
    });
    settingsProvider.selectIntegrationAgent(id);
  }
</script>

{#if options.length > 0}
  <div class={className}>
    <Select value={agentId} {onchange} {options} {size} color="neutral" />
  </div>
{/if}
