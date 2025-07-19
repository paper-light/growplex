<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { userProvider } from "../../../user/user.svelte";
  import AvatarInput from "../../../shared/ui/components/AvatarInput.svelte";
  import { pb } from "../../../shared/lib/pb";

  interface Props {
    class?: ClassValue;
  }
  let { class: className = "" }: Props = $props();

  const currentChat = $derived(userProvider.chat);

  async function handleAvatarChange(file: File) {
    await userProvider.updateChat(currentChat!.id, {
      avatar: file,
    });
  }
</script>

<AvatarInput
  class={className}
  avatar={currentChat?.avatar
    ? pb.files.getURL(currentChat, currentChat.avatar)
    : null}
  size="md"
  onChange={handleAvatarChange}
/>
