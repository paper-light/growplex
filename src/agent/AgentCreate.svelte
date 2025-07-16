<script lang="ts">
  import { userProvider } from "../user/user.svelte";
  import { createAgent } from "./create-agent";

  let { size = "md" }: { size?: "sm" | "md" | "lg" } = $props();

  const sizesMap = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  async function createGenericAgent() {
    if (!userProvider.project) return;

    await createAgent({
      projectId: userProvider.project.id,
      integrationId: userProvider.integration?.id,
    });
  }
</script>

<button
  class={["btn btn-primary w-full text-2xl", sizesMap[size]]}
  onclick={createGenericAgent}
>
  + Create New Agent
</button>
