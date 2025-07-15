<script lang="ts">
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { ChevronsDown } from "@lucide/svelte";
  import { chatProvider } from "../provider/chat.svelte";
  import { socketProvider } from "../provider/socket.svelte";
  import ChatMessage from "./Message.svelte";
  import Man from "../../shared/assets/Man.jpg";
  import Thalia from "../../shared/assets/Thalia.jpg";
  import { settingsProvider } from "../../user/settings.svelte";
  import { authProvider } from "../../user/auth.svelte";
  import { navigate } from "astro:transitions/client";
  import {
    type MessagesRecord,
    MessagesRoleOptions,
  } from "../../shared/models/pocketbase-types";
  import { pb } from "../../shared/lib/pb";

  const { roomId } = $props();

  const messages = $derived(socketProvider.history);

  const operatorAvatar = $derived(
    authProvider.user?.avatar
      ? pb.files.getURL(authProvider.user, authProvider.user.avatar)
      : Man.src
  );

  const chatAvatar = $derived(
    settingsProvider.currentChat?.avatar
      ? pb.files.getURL(
          settingsProvider.currentChat,
          settingsProvider.currentChat.avatar
        )
      : Thalia.src
  );

  let messageContainer: HTMLElement | null = $state(null);
  let showScrollButton = $state(false);

  onMount(async () => {
    await socketProvider.onlinePromise;
    const room = await chatProvider.currentRoom;
    if (room?.id !== roomId) {
      await chatProvider.setCurrentRoom(roomId);
      await navigate(`/app/chat/${roomId}`);
      scrollToBottom();
    }
  });

  $effect(() => {
    if (messages.length > 0) scrollToBottom();
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
  function getAvatar(msg: MessagesRecord) {
    if ((msg.metadata as any)?.avatar) return (msg.metadata as any).avatar;

    if (msg.role === MessagesRoleOptions.assistant) {
      return chatAvatar;
    } else if (msg.role === MessagesRoleOptions.operator) {
      return operatorAvatar;
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
        <ChatMessage {msg} {avatar} incoming={msg.role !== "operator"} />
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
