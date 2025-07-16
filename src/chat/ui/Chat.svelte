<script lang="ts">
  import type { z } from "zod";
  import { fade } from "svelte/transition";
  import {
    PUBLIC_MESSAGE_DELAY_SEC,
    PUBLIC_CHAT_MAX_MESSAGE_TOKENS,
  } from "astro:env/client";
  import { onMount } from "svelte";
  import { ChevronsRight } from "@lucide/svelte";

  import ChatMessage from "./Message.svelte";
  import Man from "../../shared/assets/Man.jpg";
  import Thalia from "../../shared/assets/Thalia.jpg";

  import { parseJwtPayload } from "../../auth/utils/parse-jwt";
  import {
    type ChatsResponse,
    type AgentsResponse,
    type MessagesResponse,
  } from "../../shared/models/pocketbase-types";
  import { pb } from "../../shared/lib/pb";

  import { socketProvider } from "../provider/socket.svelte";
  import { ChatWidgetPayloadSchema } from "../lib/models";
  import { injectTheme } from "../utils/injectTheme";
  import { scrollToBottom } from "../../shared/actions/scroll-bottom";

  interface Props {
    chat: ChatsResponse;
    agent: AgentsResponse;
    token: string;
    initTheme: string;
    payload?: z.infer<typeof ChatWidgetPayloadSchema>;
  }

  const { chat, token, payload, initTheme }: Props = $props();

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

  const maxInputChars = (PUBLIC_CHAT_MAX_MESSAGE_TOKENS || 1000) * 0.75 * 4.5;

  const messages: MessagesResponse[] = $derived(socketProvider.history);

  const online = $derived(socketProvider.online || false);

  let root: HTMLDivElement | null = $state(null);

  // INPUT
  let inputEl: HTMLTextAreaElement | null = $state(null);
  let inputText = $state("");
  let canSend = $state(true);

  let messageContainer: HTMLElement | null = $state(null);
  let showScrollButton = $state(false);

  onMount(() => {
    // THEME
    root?.setAttribute("data-theme", initTheme);
    const themeData = (chat.theme as any)?.[initTheme as any];
    injectTheme(themeData || {}, root);
    window.addEventListener("message", (event) => {
      if (!chat.domain || event.origin !== chat.domain) return;

      const { type, ...payload } = event.data || {};
      // THEME CHANGE
      if (type === "theme-change") {
        const { newTheme } = payload;
        root?.setAttribute("data-theme", newTheme);
        const themeData = (chat.theme as any)?.[newTheme as any];
        injectTheme(themeData || {}, root);
      }
    });

    socketProvider.connect(token);
    socketProvider.onlinePromise.then(() => {
      socketProvider.joinRoom(roomId);
    });

    return () => {
      socketProvider.disconnect();
    };
  });

  $effect(() => {
    if (messages.length > 0) scrollToBottom(messageContainer);
  });

  async function sendMessage() {
    if (
      !roomId ||
      !username ||
      !canSend ||
      inputText.trim().length > maxInputChars ||
      inputText.trim().length === 0
    )
      return;

    canSend = false;

    socketProvider.sendMessage(inputText, roomId, username);
    inputText = "";

    setTimeout(
      () => {
        canSend = true;
      },
      (PUBLIC_MESSAGE_DELAY_SEC || 1) * 1000
    );
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
      class="
      p-1 bg-secondary text-secondary-content rounded-full border-2 border-secondary
      hover:cursor-pointer hover:bg-base-100 hover:text-secondary
      absolute bottom-49 left-1/2 transform -translate-x-1/2 transition
      "
      aria-label="Scroll to bottom"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
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
          inputText.length === 0 ||
          inputText.length > maxInputChars}
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
