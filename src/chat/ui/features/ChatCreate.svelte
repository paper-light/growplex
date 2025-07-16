<script lang="ts">
  import { createChat } from "../../features/create-chat";
  import { userProvider } from "../../../user/user.svelte";

  let { size = "md" }: { size?: "sm" | "md" | "lg" } = $props();

  const sizesMap = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  async function createGenericChat() {
    if (!userProvider.project) return;

    await createChat({
      projectId: userProvider.project.id,
      integrationId: userProvider.integration?.id,
    });
  }
</script>

<button
  class={["btn btn-primary w-full text-2xl", sizesMap[size]]}
  onclick={createGenericChat}
>
  + Create New Chat
</button>
