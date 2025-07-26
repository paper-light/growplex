<script lang="ts">
  import { PUBLIC_CHAT_MAX_MESSAGE_TOKENS } from "astro:env/client";

  import type {
    RoomsResponse,
    UsersResponse,
  } from "../../../shared/models/pocketbase-types";
  import { userProvider } from "../../../user/user.svelte";
  import { roomsProvider } from "../../providers/rooms.svelte";
  import Button from "../../../shared/ui/lib/Button.svelte";

  import SendMessage from "../features/SendMessage.svelte";
  import MessageField from "../features/MessageField.svelte";
  import { socketProvider } from "../../providers/socket.svelte";

  const MAX_INPUT_CHARS = (PUBLIC_CHAT_MAX_MESSAGE_TOKENS || 1000) * 0.75 * 4.5;
  interface Props {
    parentRoom?: RoomsResponse | { id: string; status?: string };
    parentUser?:
      | UsersResponse
      | { name: string; role?: string; avatar?: string };
    mode?: "widget" | "admin";
  }

  let { parentRoom, parentUser, mode = "widget" }: Props = $props();

  const room = $derived(
    mode === "admin" ? roomsProvider.selectedRoom : parentRoom!
  );
  const user = $derived(mode === "admin" ? userProvider.user! : parentUser!);

  let inputEl: HTMLTextAreaElement | null = $state(null);
  let inputText = $state("");
  let canSend = $state(true);

  const disabled = $derived(
    inputText.trim().length === 0 ||
      inputText.trim().length > MAX_INPUT_CHARS ||
      !canSend ||
      !socketProvider.online
  );
</script>

{#if room}
  <div class="border-t border-base-300 bg-base-100 p-2">
    <fieldset class="fieldset">
      <MessageField
        {disabled}
        {user}
        {room}
        role={mode === "admin" ? "operator" : "user"}
        bind:canSend
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

        <SendMessage
          {disabled}
          {user}
          {room}
          {inputEl}
          role={mode === "admin" ? "operator" : "user"}
          bind:inputText
          bind:canSend
        />
      </div>
    </fieldset>
  </div>
{/if}
