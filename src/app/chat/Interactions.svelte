<script lang="ts">
  import { ChevronsRight, Send } from "@lucide/svelte";
  import { z } from "zod";
  import type { ChatMessageSchema } from "@/models/chat";
  import { chatProvider } from "./chat.svelte";
  import { socketProvider } from "./socket.svelte";
  import { nanoid } from "nanoid";
  import { authProvider } from "../auth/auth.svelte";

  const currentRoom = $derived.by(async () => await chatProvider.currentRoom);
  const messages = $derived(chatProvider.messages);

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

    // Ensure socket is connected
    if (!socketProvider.connected) {
      socketProvider.connect();
    }

    // Get room from current room or from messages
    let room = await currentRoom;
    if (!room && messages.length > 0) {
      const firstMessage = messages[0];
      if (firstMessage?.room) {
        room = { id: firstMessage.room } as any;
      }
    }

    if (!room) return;

    canSend = false;

    const newMsg: z.infer<typeof ChatMessageSchema> = {
      id: `temp-${nanoid(12)}`,
      content: inputText.trim(),
      role: "operator",
      visible: true,
      room: room.id,
      sentBy: authProvider.user!.name,
      created: new Date().toISOString().replace("T", " "),
    };

    inputText = "";

    socketProvider.sendMessage(room.id, newMsg);

    // Reset input height
    if (inputEl) {
      inputEl.style.height = "auto";
    }

    // Re-enable send after a short delay
    setTimeout(() => {
      canSend = true;
    }, 1000);
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
    ></textarea>

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
