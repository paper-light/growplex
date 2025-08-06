<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Select from "@/shared/ui/Select.svelte";
  import { agentsProvider } from "@/agent/providers/agents.svelte";
  import { integrationsProvider } from "@/integration/providers/integrations.svelte";
  import { settingsProvider } from "@/user/settings.svelte";

  interface Props {
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }
  let { class: className = "", size = "md" }: Props = $props();

  const integration = $derived(integrationsProvider.selectedIntegration);
  const selectedAgent = $derived(agentsProvider.selectedIntegrationAgent);
  const allAgents = $derived(
    agentsProvider.agents?.filter((a) => integration?.agents.includes(a.id)) ||
      []
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
    if (!id || !integration) return;

    settingsProvider.selectIntegrationAgent(id);
  }
</script>

{#if options.length > 0}
  <div class={className}>
    <Select value={agentId} {onchange} {options} {size} color="neutral" />
  </div>
{/if}
