<script lang="ts">
  import type { RecordModel } from "pocketbase";

  import Card from "@/shared/ui/Card.svelte";

  import AgentSelect from "@/agent/ui/features/AgentSelect.svelte";
  import AgentAvatarUpdate from "@/agent/ui/features/AgentAvatarUpdate.svelte";
  import { agentsProvider } from "@/agent/providers/agents.svelte";
  import EditStringField from "@/shared/ui/features/EditStringField.svelte";
  import EditTextField from "@/shared/ui/features/EditTextField.svelte";

  const agent = $derived(agentsProvider.selectedIntegrationAgent);
</script>

<Card title="Agent" class="max-w-2xl mx-auto">
  <div class="space-y-4">
    <AgentSelect />

    {#if agent}
      <div class="flex gap-6 mb-2">
        <AgentAvatarUpdate {agent} class="flex-1 max-w-24" mode="action" />

        <EditStringField
          record={agent as RecordModel}
          key="name"
          class="flex-1 font-semibold"
          ghost
        />
      </div>

      <EditTextField record={agent as RecordModel} key="system">
        <span>Write here your system instruction</span>
      </EditTextField>
    {/if}
  </div>
</Card>
