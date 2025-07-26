<script lang="ts">
  import { PUBLIC_MESSAGE_DELAY_SEC } from "astro:env/client";

  import {
    MessagesRoleOptions,
    type RoomsResponse,
    type UsersResponse,
  } from "../../../shared/models/pocketbase-types";
  import TextArea from "../../../shared/ui/lib/TextArea.svelte";
  import { socketProvider } from "../../providers/socket.svelte";
  import { pb } from "../../../shared/lib/pb";

  type Props = {
    user: UsersResponse | { name: string; avatar?: string };
    room: RoomsResponse;
    role?: "operator" | "user";
    inputText?: string;
    inputEl?: any;
    canSend?: boolean;
    disabled?: boolean;
  };

  let {
    user,
    room,
    role = "user",
    canSend = $bindable(true),
    inputEl = $bindable(),
    inputText = $bindable(""),
    disabled = false,
  }: Props = $props();

  function onkeydown(e: KeyboardEvent) {
    if (disabled) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      canSend = false;

      socketProvider.sendMessage(
        inputText,
        user.name,
        room.id,
        user.avatar
          ? {
              avatar: pb.files.getURL(user, user.avatar),
            }
          : {},
        role === "operator"
          ? MessagesRoleOptions.operator
          : MessagesRoleOptions.user
      );

      inputText = "";
      if (inputEl && "style" in inputEl) inputEl.style.height = "auto";

      setTimeout(() => {
        canSend = true;
      }, PUBLIC_MESSAGE_DELAY_SEC * 1000);
    }
  }
</script>

<TextArea
  class="resize-none w-full max-h-32 overflow-y-auto"
  bind:el={inputEl}
  bind:value={inputText}
  grow
  {onkeydown}
  placeholder="Type your message…"
  rows={1}
></TextArea>
