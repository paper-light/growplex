<script lang="ts">
  import { fade } from "svelte/transition";
  import { onMount, tick } from "svelte";
  import { ChevronsDown } from "@lucide/svelte";
  import { z } from "zod";
  import type { ChatMessageSchema } from "@/models/chat";
  import { chatProvider } from "./chat.svelte";
  import { socketProvider } from "./socket.svelte";
  import ChatMessage from "../../components/Message.svelte";
  import Man from "../../assets/Man.jpg";
  import Thalia from "../../assets/Thalia.jpg";
  import { PUBLIC_PB_URL } from "astro:env/client";
  import { settingsProvider } from "../settings/settings.svelte";
  import { authProvider } from "../auth/auth.svelte";
  import { navigate } from "astro:transitions/client";

  const { roomId } = $props();

  const messages = $derived(chatProvider.messages);

  const avatar = $derived(
    authProvider.user?.avatar
      ? `${PUBLIC_PB_URL}/api/files/users/${authProvider.user.id}/${authProvider.user.avatar}`
      : "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
  );

  const assistantAvatar = $derived(
    settingsProvider.currentChat?.avatar
      ? `${PUBLIC_PB_URL}/api/files/chats/${settingsProvider.currentChat.id}/${settingsProvider.currentChat.avatar}`
      : Thalia.src
  );

  let messageContainer: HTMLElement | null = $state(null);
  let showScrollButton = $state(false);

  onMount(async () => {
    await socketProvider.isConnectedPromise;
    const room = await chatProvider.currentRoom;
    if (room?.id !== roomId) {
      await chatProvider.setCurrentRoom(roomId);
      await navigate(`/app/chat/${roomId}`);
      scrollToBottom();
    }
  });

  $effect(() => {
    console.log("messages", messages.length);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  });

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

  // Get avatar for message
  function getAvatar(msg: z.infer<typeof ChatMessageSchema>) {
    if (msg.role === "assistant") {
      return assistantAvatar;
    } else if (msg.role === "operator") {
      return avatar;
    }
    return Man.src;
  }
</script>

<div class="flex flex-col h-full bg-base-100 relative">
  <!-- Messages Area -->
  <main
    bind:this={messageContainer}
    onscroll={onScroll}
    class="flex-1 overflow-y-auto space-y-2 p-4 overscroll-contain"
  >
    {#if messages.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-center">
        <div class="text-6xl mb-4">💬</div>
        <p class="text-base-content/70 text-lg font-medium">
          Start a conversation
        </p>
        <p class="text-base-content/50 text-sm mt-2">
          Messages will appear here once you start chatting
        </p>
      </div>
    {:else}
      {#each messages as msg (msg.id)}
        {@const avatar = getAvatar(msg)}
        <ChatMessage {msg} {avatar} />
      {/each}
    {/if}
  </main>

  {#if showScrollButton}
    <button
      transition:fade
      onclick={scrollToBottom}
      class="p-2 rounded-full hover:cursor-pointer bg-secondary absolute bottom-6 right-1/2 translate-x-1/2 z-10"
      aria-label="Scroll to bottom"
    >
      <ChevronsDown size={20} />
    </button>
  {/if}
</div>
