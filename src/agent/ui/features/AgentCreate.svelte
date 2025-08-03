<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Button from "@/shared/ui/Button.svelte";
  import { agentCrud } from "@/agent/repositories/agent-crud";
  import type { AgentsResponse } from "@/shared/models/pocketbase-types";

  interface Props {
    projectId: string;
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
    color?: "primary" | "neutral" | "error";
    style?: "outline" | "ghost";
    afterCreate?: (agent: AgentsResponse) => void;
  }

  let {
    projectId,
    class: className = "",
    size = "md",
    afterCreate,
    color = "primary",
    style = "outline",
  }: Props = $props();
</script>

<Button
  class={className}
  onclick={async () => {
    if (!projectId) return;

    const newAgent = await agentCrud.create({
      project: projectId,
    });

    afterCreate?.(newAgent);
  }}
  {size}
  {color}
  {style}
>
  + New Agent
</Button>
