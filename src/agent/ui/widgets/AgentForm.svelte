<script lang="ts">
  import AgentSelect from "../features/AgentSelect.svelte";
  import Card from "../../../shared/ui/lib/Card.svelte";
  import AgentNameUpdate from "../features/AgentNameUpdate.svelte";
  import AgentAvatarUpdate from "../features/AgentAvatarUpdate.svelte";
  import AgentSystemUpdate from "../features/AgentSystemUpdate.svelte";
</script>

<Card title="Agent" class="max-w-2xl mx-auto">
  <div class="space-y-4">
    <AgentSelect />

    <div class="flex gap-6 mb-2">
      <AgentAvatarUpdate class="flex-1 max-w-24" />

      <AgentNameUpdate class="flex-1" />
    </div>

    <AgentSystemUpdate />
  </div>
</Card>
