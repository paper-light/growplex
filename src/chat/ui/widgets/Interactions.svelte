<script lang="ts">
  import type { RoomsResponse } from "@/shared/models/pocketbase-types";
  import { roomsProvider } from "@/chat/providers/rooms.svelte";
  import Button from "@/shared/ui/Button.svelte";

  import { socketProvider } from "@/chat/providers/socket.svelte";
  import SendMessage from "@/chat/ui/features/SendMessage.svelte";
  import MessageField from "@/chat/ui/features/MessageField.svelte";
  import { CHAT_CONFIG } from "@/chat/config";

  const MAX_INPUT_CHARS = CHAT_CONFIG.MAX_MSG_TOKENS * 0.75 * 4.5;
  interface Props {
    parentRoom?: RoomsResponse;
    mode?: "widget" | "admin" | "oracle";
  }

  let { parentRoom, mode = "widget" }: Props = $props();

  const room = $derived(
    ["admin", "oracle"].includes(mode)
      ? roomsProvider.selectedRoom
      : parentRoom!
  );

  let inputEl: HTMLTextAreaElement | null = $state(null);
  let inputText = $state("");

  const disabled = $derived(
    inputText.trim().length === 0 ||
      inputText.trim().length > MAX_INPUT_CHARS ||
      !socketProvider.online ||
      (room?.status !== "operator" &&
        socketProvider.waitingAnswerRooms.has(room!.id))
  );
</script>

{#if room}
  <div class="border-t border-base-300 bg-base-100 p-2">
    <fieldset class="fieldset">
      <MessageField
        {disabled}
        {room}
        role={mode === "admin" ? "operator" : "user"}
        bind:inputEl
        bind:inputText
      />

      <div class="flex items-center justify-end gap-4">
        {#if mode === "admin"}
          {#if room?.status !== "operator"}
            <Button style="outline" onclick={() => {}}
              >Switch to operator mode</Button
            >
          {:else}
            <Button style="outline" onclick={() => {}}
              >Switch to assistant mode</Button
            >
          {/if}
        {/if}

        <SendMessage {disabled} {room} {inputEl} {mode} bind:inputText />
      </div>
    </fieldset>
  </div>
{/if}
