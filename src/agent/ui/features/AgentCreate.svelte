<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Button from "../../../shared/ui/lib/Button.svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { createAgent } from "../../features/create-agent";

  interface Props {
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }
  let { class: className = "", size = "md" }: Props = $props();

  async function createGenericAgent() {
    if (!userProvider.project) return;

    await createAgent({
      projectId: userProvider.project.id,
      integrationId: userProvider.integration?.id,
    });
  }
</script>

<div class={className}>
  <Button onclick={createGenericAgent} {size} color="primary">
    + Create New Agent
  </Button>
</div>
