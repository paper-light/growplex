<script lang="ts">
  import { ChevronsRight } from "@lucide/svelte";

  import { socketProvider, type Sender } from "@/chat/providers/socket.svelte";
  import Button from "@/shared/ui/Button.svelte";
  import {
    MessagesRoleOptions,
    type RoomsResponse,
  } from "@/shared/models/pocketbase-types";

  type Props = {
    room: RoomsResponse;
    inputText?: string;
    inputEl?: HTMLTextAreaElement | null;
    class?: string;
    disabled?: boolean;
    sender: Sender;
  };

  let {
    room,
    inputEl,
    class: className,
    inputText = $bindable(""),
    disabled = false,
    sender,
  }: Props = $props();

  async function send() {
    if (disabled) return;

    socketProvider.sendMessage(
      inputText,
      room.id,
      room.type === "oracle" ? "oracle" : "consulter",
      sender.role as MessagesRoleOptions,
      "message",
      {}
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
