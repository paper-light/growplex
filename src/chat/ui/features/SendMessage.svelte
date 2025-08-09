<script lang="ts">
  import { ChevronsRight } from "@lucide/svelte";

  import { socketProvider } from "@/chat/providers/socket.svelte";
  import Button from "@/shared/ui/Button.svelte";
  import {
    MessagesRoleOptions,
    type RoomsResponse,
    type UsersResponse,
  } from "@/shared/models/pocketbase-types";
  import { pb } from "@/shared/lib/pb";

  type Props = {
    user: UsersResponse | { name: string; avatar?: string };
    room: RoomsResponse | { id: string };
    role?: "operator" | "user";
    inputText?: string;
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
    disabled = false,
  }: Props = $props();

  async function send() {
    if (disabled) return;

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
  }
</script>

<div class={className}>
  <Button {disabled} onclick={send}>
    <ChevronsRight size={32} />
  </Button>
</div>
