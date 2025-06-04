<script lang="ts">
  import { z } from "zod";
  import { DateTime } from "luxon";

  import type { ChatSchema } from "@/models/chat";
  import { onMount, tick } from "svelte";
  import Message from "../Message.svelte";
  import { fade } from "svelte/transition";

  interface Props {
    chat: z.infer<typeof ChatSchema>;
  }

  interface IMessage {
    content: string;
    incoming?: boolean;
    name?: string;
    timestamp?: DateTime;
    status?: string;
    avatarUrl?: string;
  }

  const { chat }: Props = $props();

  let messageContainer: HTMLElement | null = $state(null);

  let showScrollButton = $state(false);

  let inputText = $state("");

  let messages: IMessage[] = $state([
    {
      content:
        "Yeah, I will provide info! Yeah, I will provide info! Yeah, I will provide info!",
      incoming: true,
      timestamp: DateTime.local().minus({ minutes: 30 }),
    },
    {
      content:
        "Yeah, I will provide info! Yeah, I will provide info! Yeah, I will provide info!",
      incoming: false,
      timestamp: DateTime.local().minus({ minutes: 28 }),
    },
    {
      content:
        "Yeah, I will provide info! Yeah, I will provide info! Yeah, I will provide info!",
      incoming: true,
      timestamp: DateTime.local().minus({ minutes: 25 }),
    },
    {
      content:
        "Yeah, I will provide info! Yeah, I will provide info! Yeah, I will provide info!",
      incoming: false,
      timestamp: DateTime.local().minus({ minutes: 22 }),
    },
    {
      content:
        "Yeah, I will provide info! Yeah, I will provide info! Yeah, I will provide info!",
      incoming: true,
      timestamp: DateTime.local().minus({ minutes: 14 }),
    },
    {
      content:
        "Yeah, I will provide info! Yeah, I will provide info! Yeah, I will provide info!",
      incoming: false,
      timestamp: DateTime.local().minus({ minutes: 6 }),
    },
    {
      content:
        "Yeah, I will provide info! Yeah, I will provide info! Yeah, I will provide info!",
      incoming: true,
      timestamp: DateTime.local().minus({ minutes: 14 }),
    },
    {
      content:
        "Yeah, I will provide info! Yeah, I will provide info! Yeah, I will provide info!",
      incoming: false,
      timestamp: DateTime.local().minus({ minutes: 6 }),
    },
  ]);

  onMount(() => {
    window.addEventListener("message", (event) => {
      if (event.origin !== chat.domain) return;
      const { type, newTheme } = event.data || {};
      if (type === "theme-change") {
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    });
  });

  async function catchNewMessage(m: IMessage) {
    inputText = "";
    messages.push(m);
    await tick();
    scrollToBottom();
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
</script>

<!-- Chat Container -->
<div
  class="w-screen h-screen flex flex-col bg-base-100 shadow-lg rounded-lg p-4"
>
  <!-- Header -->
  <header
    class="flex items-center justify-between border-b border-base-300 px-4 py-3"
  >
    <!-- Left side: Chat title + status -->
    <div class="flex items-center space-x-3">
      <!-- Chat avatar or icon -->
      <div class="avatar">
        <div
          class="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center"
        >
          <!-- If you have a chat image URL, replace the text with <img src={chat.avatarUrl} /> -->
          <div class="w-10 rounded-full">
            <img alt="avatar" src="https://i.pravatar.cc/40?img=5" />
          </div>
        </div>
      </div>
      <div class="flex flex-col">
        <h2 class="text-lg font-semibold text-base-content">Assistant</h2>
        <span class="text-xs text-gray-500"> Online </span>
      </div>
    </div>

    <!-- Right side: Action buttons -->
    <div class="flex items-center space-x-2"></div>
  </header>

  <!-- Messages Area -->
  <main
    bind:this={messageContainer}
    onscroll={onScroll}
    class="flex-1 overflow-y-auto space-y-2 p-2 overscroll-contain"
  >
    {#each messages as message, index (index)}
      <Message {...message}>
        {message.content}
      </Message>
    {/each}
  </main>

  {#if showScrollButton}
    <!-- Scroll-to-bottom button -->
    <button
      transition:fade
      onclick={scrollToBottom}
      class="btn btn-secondary btn-circle fixed bottom-20 left-1/2 transform -translate-x-1/2 transition"
      aria-label="Scroll to bottom"
    >
      <!-- Down arrow icon -->
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
  <footer class="border-t border-base-300 pt-2 mt-2">
    <div class="flex gap-2">
      <input
        onkeydown={(e) => {
          if (e.key === "Enter" && inputText.trim() !== "") {
            catchNewMessage({
              content: inputText,
              incoming: false,
              timestamp: DateTime.local(),
            });
          }
        }}
        bind:value={inputText}
        type="text"
        placeholder="Type your message…"
        class="input input-bordered flex-1"
      />
      <button
        onclick={() =>
          catchNewMessage({
            content: inputText,
            incoming: false,
            timestamp: DateTime.local().minus({ minutes: 6 }),
          })}
        class="btn btn-primary">Send</button
      >
    </div>
  </footer>
</div>
