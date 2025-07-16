<script lang="ts">
  import { PUBLIC_MESSAGE_DELAY_SEC } from "astro:env/client";
  import { Send } from "@lucide/svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { MessagesRoleOptions } from "../../../shared/models/pocketbase-types";
  import { pb } from "../../../shared/lib/pb";
  import { socketProvider } from "../../provider/socket.svelte";
  import { roomsProvider } from "../../provider/rooms.svelte";

  const roomId = $derived(roomsProvider.room?.id);

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
    if (!roomId) return;

    canSend = false;

    socketProvider.sendMessage(
      inputText,
      userProvider.user!.name,
      roomId,
      {
        avatar: pb.files.getURL(userProvider.user!, userProvider.user!.avatar),
      },
      MessagesRoleOptions.operator
    );

    inputText = "";

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
