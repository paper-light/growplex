<script lang="ts">
  import type { z } from "zod";
  import { fade } from "svelte/transition";
  import {
    PUBLIC_MESSAGE_DELAY_SEC,
    PUBLIC_PB_URL,
    PUBLIC_CHAT_MAX_MESSAGE_TOKENS,
  } from "astro:env/client";
  import { onDestroy, onMount, tick } from "svelte";
  import { io, Socket } from "socket.io-client";
  import { nanoid } from "nanoid";
  import { ChevronsRight } from "@lucide/svelte";

  import type { ChatMessageSchema, ChatSchema, AgentSchema } from "@/models";

  import ChatMessage from "../components/Message.svelte";
  import Man from "../assets/Man.jpg";
  import Thalia from "../assets/Thalia.jpg";

  import { injectTheme } from "./injectTheme";
  import { pb } from "./pb";

  interface Props {
    chat: z.infer<typeof ChatSchema>;
    agent: z.infer<typeof AgentSchema>;
    token?: string | null;
  }

  const { chat, agent, token }: Props = $props();

  const assistantAvatar = chat.avatar
    ? `${PUBLIC_PB_URL}/api/files/chats/${chat.id}/${chat.avatar}`
    : Thalia.src;

  const maxInputChars = PUBLIC_CHAT_MAX_MESSAGE_TOKENS * 0.75 * 4.5;

  let socket: Socket | null = $state(null);
  let roomId = $state("");
  let username = $state("");

  let messages: z.infer<typeof ChatMessageSchema>[] = $state([]);

  let inputEl: HTMLTextAreaElement | null = $state(null);
  let inputText = $state("");
  let canSend = $state(true);

  let messageContainer: HTMLElement | null = $state(null);
  let showScrollButton = $state(false);

  $effect(() => {
    if (messageContainer) scrollToBottom();
  });

  onMount(async () => {
    const theme = document.documentElement.getAttribute("data-theme");
    injectTheme(chat.theme[theme as "light" | "dark"]);

    window.addEventListener("message", (event) => {
      if (event.origin !== chat.domain) return;
      const { type, newTheme } = event.data || {};
      if (type === "theme-change") {
        document.documentElement.setAttribute("data-theme", newTheme);
        injectTheme(chat.theme[newTheme as "light" | "dark"]);
      }
    });

    const savedRoom = localStorage.getItem("chatRoomId");
    if (savedRoom) {
      roomId = savedRoom;
    } else {
      const room = await pb
        .collection("rooms")
        .create({ status: "auto", chat: chat.id });
      localStorage.setItem("chatRoomId", room.id);
    }

    const savedUser = localStorage.getItem("chatUsername");
    if (savedUser) {
      username = savedUser;
    } else {
      username = `Guest-${nanoid(4)}`;
      localStorage.setItem("chatUsername", username);
    }

    socket = io({
      auth: {
        token: token || undefined,
      },
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to server, socket.id =", socket?.id);
      socket?.emit("join-room", { chatId: chat.id, roomId, username });
    });

    socket.on(
      "chat-history",
      (history: z.infer<typeof ChatMessageSchema>[]) => {
        console.log("HISTORY");
        messages = history;
        tick().then(() => scrollToBottom());
      }
    );

    socket.on("new-message", (m: z.infer<typeof ChatMessageSchema>) => {
      messages.push(m);
      tick().then(() => scrollToBottom());
    });

    socket.on("rate-limit", (data: { message: string }) => {
      console.warn("Rate limit from server:", data.message);
    });

    // socket.on("room-closed", () => {
    //   console.log("🔴 Room has been closed by operator.");
    // });
  });

  onDestroy(() => {
    socket?.disconnect();
  });

  async function sendMessage() {
    if (!canSend) return;
    if (inputText.trim().length === 0) return;

    canSend = false;

    const newMsg: z.infer<typeof ChatMessageSchema> = {
      id: `temp-${nanoid(12)}`,
      content: inputText.trim(),
      role: "user",
      visible: true,
      room: roomId,
      sentBy: username,
      created: new Date().toISOString().replace("T", " "),
    };

    inputText = "";
    messages.push(newMsg);

    socket?.emit("send-message", {
      chatId: chat.id,
      roomId,
      msgStr: JSON.stringify(newMsg),
    });

    await tick();
    scrollToBottom();

    setTimeout(() => {
      canSend = true;
    }, PUBLIC_MESSAGE_DELAY_SEC * 1000);
  }

  function scrollToBottom() {
    if (!messageContainer) return;
    messageContainer.scrollTo({
      top: messageContainer.scrollHeight,
      behavior: "smooth",
    });
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
  class="w-screen h-screen flex flex-col bg-base-100 shadow-lg rounded-lg px-4 pt-4"
>
  <!-- Header -->
  <header
    class="flex items-center justify-between border-b border-base-300 px-4 py-3"
  >
    <div class="flex items-center space-x-3">
      <div class="avatar">
        <div
          class="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center"
        >
          <img alt="avatar" src={assistantAvatar} />
        </div>
      </div>
      <div class="flex flex-col">
        <h2 class="text-lg font-semibold text-base-content">{agent.name}</h2>
        <span class="text-xs text-gray-500">Online</span>
      </div>
    </div>
    <div class="flex items-center space-x-2"></div>
  </header>

  <!-- Messages Area -->
  <main
    bind:this={messageContainer}
    onscroll={onScroll}
    class="flex-1 overflow-y-auto space-y-2 p-2 overscroll-contain"
  >
    {#each messages as msg (msg.id)}
      {@const avatar =
        msg.role === "assistant"
          ? assistantAvatar
          : msg.role === "user"
            ? Man.src
            : Man.src}
      <ChatMessage {msg} {avatar} />
    {/each}
  </main>

  {#if showScrollButton}
    <button
      transition:fade
      onclick={scrollToBottom}
      class="btn btn-secondary btn-circle fixed bottom-49 left-1/2 transform -translate-x-1/2 transition"
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
      sticky bottom-0 left-0 w-full z-10
      border-t border-base-300
      bg-base-100
      px-4 py-2
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

    <div class="text-xs text-center mt-4">
      Made by
      <a
        class="link link-hover font-semibold"
        target="_blank"
        href="https://growplex.dev/">Growplex</a
      >
    </div>
  </footer>
</div>
