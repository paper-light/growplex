<script lang="ts">
  import { ChevronsRight } from "@lucide/svelte";

  import { socketProvider } from "@/chat/providers/socket.svelte";
  import Button from "@/shared/ui/lib/Button.svelte";
  import {
    MessagesRoleOptions,
    type RoomsResponse,
    type UsersResponse,
  } from "@/shared/models/pocketbase-types";
  import { pb } from "@/shared/lib/pb";
  import { CHAT_CONFIG } from "@/chat/config";

  type Props = {
    user: UsersResponse | { name: string; avatar?: string };
    room: RoomsResponse | { id: string };
    role?: "operator" | "user";
    inputText?: string;
    canSend?: boolean;
    inputEl?: HTMLTextAreaElement | null;
    class?: string;
    disabled?: boolean;
  };

  let {
    user,
    room,
    inputEl,
    role = "user",
    class: className,
    inputText = $bindable(""),
    canSend = $bindable(true),
    disabled = false,
  }: Props = $props();

  async function send() {
    if (disabled) return;

    canSend = false;

    socketProvider.sendMessage(
      inputText,
      user.name,
      room.id,
      {
        avatar: user?.avatar ? pb.files.getURL(user, user.avatar) : "",
      },
      role === "operator"
        ? MessagesRoleOptions.operator
        : MessagesRoleOptions.user
    );

    inputText = "";

    if (inputEl) inputEl.style.height = "auto";

    setTimeout(() => {
      canSend = true;
    }, CHAT_CONFIG.MESSAGE_DELAY_SEC * 1000);
  }
</script>

<div class={className}>
  <Button {disabled} onclick={send}>
    <ChevronsRight size={32} />
  </Button>
</div>
