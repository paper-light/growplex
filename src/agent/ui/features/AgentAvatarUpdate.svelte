<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import AvatarInput from "@/shared/ui/components/AvatarInput.svelte";
  import { pb } from "@/shared/lib/pb";
  import type { AgentsResponse } from "@/shared/models/pocketbase-types";
  import { agentCrud } from "@/agent/repositories/agent-crud";

  interface Props {
    agent?: AgentsResponse | null;
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
    afterUpdate?: (agent: AgentsResponse) => void;
    mode?: "form" | "action";
  }
  let {
    agent,
    class: className = "",
    afterUpdate,
    size = "md",
    mode = "form",
  }: Props = $props();

  async function handleAvatarChange(file: File) {
    if (!agent) return;

    const updatedAgent = await agentCrud.update({
      id: agent.id,
      avatar: file,
    });

    afterUpdate?.(updatedAgent);
  }
</script>

{#key agent?.id}
  <AvatarInput
    class={className}
    avatar={agent?.avatar ? pb.files.getURL(agent, agent.avatar) : null}
    {size}
    {mode}
    onChange={handleAvatarChange}
  />
{/key}
