<script lang="ts">
  import { PUBLIC_MESSAGE_DELAY_SEC } from "astro:env/client";
  import { ChevronsRight, Send } from "@lucide/svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { MessagesRoleOptions } from "../../../shared/models/pocketbase-types";
  import { pb } from "../../../shared/lib/pb";
  import { socketProvider } from "../../providers/socket.svelte";
  import { roomsProvider } from "../../providers/rooms.svelte";
  import Button from "../../../shared/ui/lib/Button.svelte";

  const room = $derived(roomsProvider.selectedRoom);

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
    if (!room) return;

    canSend = false;

    socketProvider.sendMessage(
      inputText,
      userProvider.user!.name,
      room.id,
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

    <div class="flex items-center justify-end gap-4">
      {#if room?.status !== "operator"}
        <Button style="outline" onclick={() => {}}>Switch to operator</Button>
      {:else}
        <Button style="outline" onclick={() => {}}>Switch to assistant</Button>
      {/if}

      <Button
        disabled={!canSend ||
          inputText.trim().length === 0 ||
          !socketProvider.online}
        onclick={sendMessage}
      >
        <ChevronsRight size={32} />
      </Button>
    </div>
  </fieldset>
</div>
