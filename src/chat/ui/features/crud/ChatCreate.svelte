<!-- <script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { createChat } from "../../features/create-chat";
  import { userProvider } from "../../../user/user.svelte";

  import Button from "../../../shared/ui/lib/Button.svelte";

  interface Props {
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }
  let { class: className = "", size = "md" }: Props = $props();

  async function createGenericChat() {
    if (!userProvider.project) return;

    await createChat({
      projectId: userProvider.project.id,
      integrationId: userProvider.integration?.id,
    });
  }
</script>

<div class={className}>
  <Button onclick={createGenericChat} {size} color="primary">
    + Create New Chat
  </Button>
</div> -->
