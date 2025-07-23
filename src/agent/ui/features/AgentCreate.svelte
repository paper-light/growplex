<!-- <script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Button from "../../../shared/ui/lib/Button.svelte";

  import { agentCrud } from "../../repositories/agent-crud";

  interface Props {
    projectId: string;
    integrationId: string;
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }
  let {
    projectId,
    integrationId,
    class: className = "",
    size = "md",
  }: Props = $props();

  async function createGenericAgent() {
    await agentCrud.create({
      projectId,
      integrationId,
    });
  }
</script>

<div class={className}>
  <Button onclick={createGenericAgent} {size} color="primary">
    + Create New Agent
  </Button>
</div> -->
