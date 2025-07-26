<script lang="ts">
  import { fade } from "svelte/transition";
  import { untrack } from "svelte";
  import { ChevronsDown } from "@lucide/svelte";

  import ChatMessage from "../entities/Message.svelte";
  import Man from "../../../shared/assets/Man.jpg";
  import Thalia from "../../../shared/assets/Thalia.jpg";

  import {
    type ChatsResponse,
    type AgentsResponse,
  } from "../../../shared/models/pocketbase-types";
  import { pb } from "../../../shared/lib/pb";

  import { socketProvider } from "../../providers/socket.svelte";
  import { injectTheme } from "../../utils/injectTheme";
  import { scrollToBottom } from "../../../shared/actions/scroll-bottom";
  import ToolMessage from "../entities/ToolMessage.svelte";
  import Interactions from "./Interactions.svelte";

  interface Props {
    chat: ChatsResponse;
    agent: AgentsResponse;
    root: HTMLElement;
    roomId: string;
    username: string;
    theme?: string;
  }

  const { root, chat, theme, roomId, username }: Props = $props();

  const chatAvatar = chat.avatar
    ? pb.files.getURL(chat, chat.avatar)
    : Thalia.src;

  const messages = $derived.by(() => {
    if (!roomId) return [];
    const history = socketProvider.histories.get(roomId);
    return history || [];
  });

  const online = $derived(socketProvider.online);

  let messageContainer: HTMLElement | null = $state(null);
  let showScrollButton = $state(false);

  $effect(() => {
    if (!theme || !root) return;

    root.setAttribute("data-theme", theme);

    // Config theme
    const themeData = (chat.theme as any)?.config[theme as any];
    injectTheme(themeData || {}, root);
  });

  $effect(() => {
    if (messages.length > 0) scrollToBottom(messageContainer);
  });

  $effect(() => {
    if (!roomId || !socketProvider.online) return;

    untrack(() => {
      socketProvider.joinRoom(roomId);
    });
  });

  function onScroll() {
    if (!messageContainer) return;
    const { scrollTop, clientHeight, scrollHeight } = messageContainer;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
    showScrollButton = !atBottom;
  }
</script>

<div
  class="w-full h-full flex flex-col bg-base-100 shadow-lg px-4 pt-4 relative min-h-0 overflow-hidden max-h-full"
  style="height: 100%; max-height: 100%;"
>
  <!-- Header -->
  <header
    class="flex items-center justify-between border-b border-base-300 px-4 py-3 flex-shrink-0"
  >
    <div class="flex items-center space-x-3">
      <div class="avatar">
        <div
          class="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center"
        >
          <img alt="avatar" src={chatAvatar} />
        </div>
      </div>
      <div class="flex flex-col">
        <h2 class="text-lg font-semibold text-base-content">
          {chat.name || "Support Chat"}
        </h2>
        <span
          class="text-xs"
          class:text-gray-500={!online}
          class:text-primary={online}
        >
          {online ? "Online" : "Offline"}
        </span>
      </div>
    </div>
    <div class="flex items-center space-x-2"></div>
  </header>

  <!-- Messages Area -->
  <main
    bind:this={messageContainer}
    onscroll={onScroll}
    class="flex-1 min-h-0 overflow-y-auto space-y-2 p-2 overscroll-contain"
  >
    {#each messages as msg (msg.id)}
      {@const avatar =
        (msg.metadata as any)?.avatar || msg.role === "assistant"
          ? chatAvatar
          : Man.src}

      {#if msg.role === "tool"}
        <ToolMessage type="waitingOperator" />
      {:else}
        <ChatMessage {msg} {avatar} incoming={msg.role !== "user"} />
      {/if}
    {/each}
  </main>

  {#if showScrollButton}
    <button
      transition:fade
      onclick={() => scrollToBottom(messageContainer)}
      class="p-2 rounded-full hover:cursor-pointer bg-secondary absolute bottom-46 right-1/2 translate-x-1/2 z-10"
      aria-label="Scroll to bottom"
    >
      <ChevronsDown size={20} />
    </button>
  {/if}

  <!-- Footer with Input + Send Button -->
  <footer
    class="
      flex-shrink-0
      border-t border-base-300
      bg-base-100
    "
  >
    <Interactions
      parentRoom={{ id: roomId }}
      parentUser={{ name: username }}
      mode="widget"
    />
  </footer>
</div>
