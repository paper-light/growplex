<script lang="ts">
  import { nanoid } from "nanoid";
  import { PUBLIC_MESSAGE_DELAY_SEC } from "astro:env/client";
  import { Send } from "@lucide/svelte";

  import { chatProvider } from "../provider/chat.svelte";
  import { socketProvider } from "../provider/socket.svelte";
  import { authProvider } from "../../user/auth.svelte";
  import {
    type MessagesRecord,
    MessagesRoleOptions,
  } from "../../shared/models/pocketbase-types";
  import { pb } from "../../shared/lib/pb";

  const currentRoom = $derived.by(async () => await chatProvider.currentRoom);
  const messages = $derived(socketProvider.history);

  let inputEl: HTMLTextAreaElement | null = $state(null);
  let inputText = $state("");
  let canSend = $state(true);

  function autoGrow() {
    if (!inputEl) return;
    inputEl.style.height = "auto";
    inputEl.style.height = `${inputEl.scrollHeight}px`;
  }

  async function sendMessage() {
    if (!canSend) return;
    if (inputText.trim().length === 0) return;

    let room = await currentRoom;
    if (!room && messages.length > 0) {
      const firstMessage = messages[0];
      if (firstMessage?.room) {
        room = { id: firstMessage.room } as any;
      }
    }

    if (!room) return;

    canSend = false;

    socketProvider.sendMessage(
      inputText,
      room.id,
      authProvider.user!.name,
      {
        avatar: pb.files.getURL(authProvider.user!, authProvider.user!.avatar),
      },
      MessagesRoleOptions.operator
    );

    console.log("sent message", inputText);
    inputText = "";
    console.log("after", inputText);

    if (inputEl) inputEl.style.height = "auto";

    setTimeout(() => {
      canSend = true;
    }, PUBLIC_MESSAGE_DELAY_SEC * 1000);
  }
</script>

<div class="border-t border-base-300 bg-base-100 p-4">
  <fieldset class="fieldset">
    <textarea
      bind:this={inputEl}
      bind:value={inputText}
      oninput={autoGrow}
      onkeydown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      }}
      placeholder="Type your message…"
      class="textarea textarea-bordered resize-none w-full max-h-32 overflow-y-auto"
      rows="1"
    />

    <button
      disabled={!canSend || inputText.length === 0}
      onclick={sendMessage}
      class="btn btn-primary btn-lg btn-circle ml-2"
      aria-label="Send message"
    >
      <Send size={20} />
    </button>
  </fieldset>
</div>
