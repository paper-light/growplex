<script lang="ts">
  import { userProvider } from "../../../user/user.svelte";

  import AgentSelect from "../features/AgentSelect.svelte";
  import AgentCreate from "../features/AgentCreate.svelte";
  import Card from "../../../shared/ui/lib/Card.svelte";
  import AgentNameUpdate from "../features/AgentNameUpdate.svelte";
  import AgentAvatarUpdate from "../features/AgentAvatarUpdate.svelte";
  import AgentSystemUpdate from "../features/AgentSystemUpdate.svelte";

  const currentAgent = $derived(userProvider.agent || null);
  const allAgents = $derived(userProvider.project?.expand?.agents || []);
</script>

{#if !currentAgent}
  <div class="flex flex-col items-center justify-center gap-6 py-16">
    <div class="w-full max-w-xl flex flex-col gap-4">
      <AgentCreate size="lg" />
      {#if allAgents.length > 0}
        <AgentSelect size="lg" />
      {/if}
    </div>
  </div>
{:else}
  <Card>
    <div class="flex gap-6">
      <AgentAvatarUpdate class="flex-1 max-w-24" />

      <AgentNameUpdate class="flex-1" />
    </div>
    <AgentSystemUpdate />
  </Card>
{/if}
