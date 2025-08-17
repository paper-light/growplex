<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import AvatarInput from "@/shared/ui/components/AvatarInput.svelte";
  import { pb } from "@/shared/lib/pb";
  import type { ChatsResponse } from "@/shared/models/pocketbase-types";
  import { chatCrud } from "@/chat/repositories/chat-crud";
  import Pantheon from "@/shared/assets/Pantheon.jpg";

  interface Props {
    chat: ChatsResponse | null;
    class?: ClassValue;
    mode?: "form" | "action";
    afterUpdate?: (chat: ChatsResponse) => void;
  }

  let {
    chat,
    class: className = "",
    mode = "form",
    afterUpdate,
  }: Props = $props();

  const avatar = $derived(
    chat?.avatar ? pb.files.getURL(chat, chat.avatar) : null
  );

  async function handleAvatarChange(file: File) {
    if (!chat) return;

    const updatedChat = await chatCrud.update({
      id: chat.id,
      avatar: file,
    });

    afterUpdate?.(updatedChat);
  }
</script>

{#key chat?.id}
  <AvatarInput
    {mode}
    class={className}
    {avatar}
    size="md"
    fallbackSrc={Pantheon.src}
    onChange={handleAvatarChange}
  />
{/key}
