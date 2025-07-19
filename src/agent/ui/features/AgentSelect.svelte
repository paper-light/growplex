<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { userProvider } from "../../../user/user.svelte";
  import Select from "../../../shared/ui/lib/Select.svelte";

  interface Props {
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }
  let { class: className = "", size = "md" }: Props = $props();

  const integration = $derived(userProvider.integration);
  const allAgents = $derived(userProvider.project?.expand?.agents || []);

  let value = $state("");

  const options = $derived.by(() => {
    return allAgents.map((agent) => ({
      value: agent.id,
      label: agent.name || agent.id,
    }));
  });

  async function onchange(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || !integration) return;
    await userProvider.updateIntegration(integration.id, { agent: id });
  }
</script>

<div class={className}>
  <Select bind:value {onchange} {options} {size} color="neutral">
    Select from project…
  </Select>
</div>
