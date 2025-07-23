<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import AvatarInput from "../../../shared/ui/components/AvatarInput.svelte";
  import { pb } from "../../../shared/lib/pb";
  import type { AgentsResponse } from "../../../shared/models/pocketbase-types";
  import { agentCrud } from "../../repositories/agent-crud";
  interface Props {
    agent: AgentsResponse | null;
    class?: ClassValue;
  }
  let { agent, class: className = "" }: Props = $props();

  async function handleAvatarChange(file: File) {
    if (!agent) return;

    await agentCrud.update({
      id: agent.id,
      avatar: file,
    });
  }
</script>

<AvatarInput
  class={className}
  avatar={agent?.avatar ? pb.files.getURL(agent, agent.avatar) : null}
  size="md"
  onChange={handleAvatarChange}
/>
