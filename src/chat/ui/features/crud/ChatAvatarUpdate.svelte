<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import AvatarInput from "@/shared/ui/components/AvatarInput.svelte";
  import { pb } from "@/shared/lib/pb";
  import type { ChatsResponse } from "@/shared/models/pocketbase-types";
  import { chatCrud } from "@/chat/repositories/chat-crud";

  interface Props {
    chat: ChatsResponse | null;
    class?: ClassValue;
  }

  let { chat, class: className = "" }: Props = $props();

  const avatar = $derived(
    chat?.avatar ? pb.files.getURL(chat, chat.avatar) : null
  );

  async function handleAvatarChange(file: File) {
    if (!chat) return;

    await chatCrud.update({
      id: chat.id,
      avatar: file,
    });
  }
</script>

<AvatarInput
  class={className}
  {avatar}
  size="md"
  onChange={handleAvatarChange}
/>
