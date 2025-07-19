<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { userProvider } from "../../../user/user.svelte";
  import AvatarInput from "../../../shared/ui/components/AvatarInput.svelte";
  import { pb } from "../../../shared/lib/pb";

  interface Props {
    class?: ClassValue;
  }
  let { class: className = "" }: Props = $props();

  const currentAgent = $derived(userProvider.agent);

  async function handleAvatarChange(file: File) {
    await userProvider.updateAgent(currentAgent!.id, {
      avatar: file,
    });
  }
</script>

<AvatarInput
  class={className}
  avatar={currentAgent?.avatar
    ? pb.files.getURL(currentAgent, currentAgent.avatar)
    : null}
  size="md"
  onChange={handleAvatarChange}
/>
