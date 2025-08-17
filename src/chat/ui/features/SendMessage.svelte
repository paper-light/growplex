<script lang="ts">
  import { ChevronsRight } from "@lucide/svelte";

  import { socketProvider } from "@/chat/providers/socket.svelte";
  import Button from "@/shared/ui/Button.svelte";
  import {
    MessagesRoleOptions,
    type RoomsResponse,
  } from "@/shared/models/pocketbase-types";

  type Props = {
    room: RoomsResponse | { id: string };
    role?: "operator" | "user";
    inputText?: string;
    inputEl?: HTMLTextAreaElement | null;
    class?: string;
    disabled?: boolean;
  };

  let {
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
      room.id,
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
