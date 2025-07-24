<script lang="ts">
  import type { z } from "zod";
  import { fade } from "svelte/transition";
  import {
    PUBLIC_MESSAGE_DELAY_SEC,
    PUBLIC_CHAT_MAX_MESSAGE_TOKENS,
  } from "astro:env/client";
  import { onMount, untrack } from "svelte";
  import { ChevronsDown, ChevronsRight } from "@lucide/svelte";

  import ChatMessage from "../entities/Message.svelte";
  import Man from "../../../shared/assets/Man.jpg";
  import Thalia from "../../../shared/assets/Thalia.jpg";

  import { parseJwtPayload } from "../../../auth/utils/parse-jwt";
  import {
    type ChatsResponse,
    type AgentsResponse,
    type MessagesResponse,
  } from "../../../shared/models/pocketbase-types";
  import { pb } from "../../../shared/lib/pb";

  import { socketProvider } from "../../providers/socket.svelte";
  import { ChatWidgetPayloadSchema } from "../../lib/models";
  import { injectTheme } from "../../utils/injectTheme";
  import { scrollToBottom } from "../../../shared/actions/scroll-bottom";

  const MAX_INPUT_CHARS = (PUBLIC_CHAT_MAX_MESSAGE_TOKENS || 1000) * 0.75 * 4.5;
  interface Props {
    chat: ChatsResponse;
    agent: AgentsResponse;
    token: string;
    initTheme?: string;
    payload?: z.infer<typeof ChatWidgetPayloadSchema>;
  }

  const { chat, token, payload, initTheme }: Props = $props();

  const theme = $derived(
    initTheme || (chat.theme as any)?.production || "light"
  );

  const { roomId, username } = $derived(
    payload ||
      (() => {
        const parsed = parseJwtPayload(token!);
        if (!parsed) {
          throw new Error("Invalid token: unable to parse JWT payload");
        }
        return ChatWidgetPayloadSchema.parse(parsed);
      })()
  );

  const chatAvatar = chat.avatar
    ? pb.files.getURL(chat, chat.avatar)
    : Thalia.src;

  const messages = $derived.by(() => {
    if (!roomId) return [];
    const history = socketProvider.histories.get(roomId);
    return history || [];
  });

  const online = $derived(socketProvider.online);

  let root: HTMLDivElement | null = $state(null);

  // INPUT
  let inputEl: HTMLTextAreaElement | null = $state(null);
  let inputText = $state("");
  let canSend = $state(true);

  let messageContainer: HTMLElement | null = $state(null);
  let showScrollButton = $state(false);

  onMount(() => {
    window.addEventListener("message", (event) => {
      if (!chat.domain || event.origin !== chat.domain) return;

      const { type, ...payload } = event.data || {};
      // THEME CHANGE
      if (type === "theme-change") {
        const { newTheme } = payload;
        root?.setAttribute("data-theme", newTheme);
        const themeData = (chat.theme as any)?.config[newTheme as any];
        injectTheme(themeData || {}, root);
      }
    });

    socketProvider.connect(token);
  });

  $effect(() => {
    if (messages.length > 0) scrollToBottom(messageContainer);
  });

  $effect(() => {
    if (!root || !theme) return;

    root.setAttribute("data-theme", theme);
    const themeData = (chat.theme as any)?.config[theme as any];
    injectTheme(themeData || {}, root);
  });

  $effect(() => {
    if (!roomId || !socketProvider.online) return;

    untrack(() => {
      socketProvider.joinRoom(roomId);
    });
  });

  async function sendMessage() {
    if (
      !roomId ||
      !username ||
      !canSend ||
      inputText.trim().length > MAX_INPUT_CHARS ||
      inputText.trim().length === 0
    )
      return;

    canSend = false;

    socketProvider.sendMessage(inputText, username, roomId);
    inputText = "";

    setTimeout(() => {
      canSend = true;
    }, PUBLIC_MESSAGE_DELAY_SEC * 1000);
  }

  function onScroll() {
    if (!messageContainer) return;
    const { scrollTop, clientHeight, scrollHeight } = messageContainer;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
    showScrollButton = !atBottom;
  }

  function autoGrow() {
    if (!inputEl) return;
    inputEl.style.height = "auto";
    inputEl.style.height = `${inputEl.scrollHeight}px`;
  }
</script>

<div
  bind:this={root}
  class="w-full h-full flex flex-col bg-base-100 shadow-lg rounded-lg px-4 pt-4 relative min-h-0 overflow-hidden max-h-full"
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
      <ChatMessage {msg} {avatar} incoming={msg.role !== "user"} />
    {/each}
  </main>

  {#if showScrollButton}
    <button
      transition:fade
      onclick={() => scrollToBottom(messageContainer)}
      class="p-2 rounded-full hover:cursor-pointer bg-secondary absolute bottom-6 right-1/2 translate-x-1/2 z-10"
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
      px-3 py-1
    "
  >
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
        class="textarea textarea-bordered resize-none w-full max-h-40 overflow-y-auto"
        rows="1"
      ></textarea>

      <button
        disabled={!canSend ||
          inputText.trim().length === 0 ||
          inputText.trim().length > MAX_INPUT_CHARS ||
          !socketProvider.online}
        onclick={sendMessage}
        class="label btn btn-primary btn-lg btn-block ml-auto w-fit rounded-xl"
      >
        <ChevronsRight size={32} />
      </button>
    </fieldset>

    <div class="text-xs text-center mt-2">
      Made by
      <a
        class="link link-hover font-semibold"
        target="_blank"
        href="https://growplex.dev/">Growplex</a
      >
    </div>
  </footer>
</div>
