<script lang="ts">
  import { fade } from "svelte/transition";
  import { ChevronsDown } from "@lucide/svelte";
  import { roomsProvider } from "../../provider/rooms.svelte";
  import { socketProvider } from "../../provider/socket.svelte";
  import ChatMessage from "../entities/Message.svelte";
  import Man from "../../../shared/assets/Man.jpg";
  import Thalia from "../../../shared/assets/Thalia.jpg";
  import { userProvider } from "../../../user/user.svelte";
  import {
    type MessagesRecord,
    MessagesRoleOptions,
  } from "../../../shared/models/pocketbase-types";
  import { pb } from "../../../shared/lib/pb";
  import { scrollToBottom } from "../../../shared/actions/scroll-bottom";

  const room = $derived(roomsProvider.room);
  const messages = $derived(
    room ? socketProvider.histories[room.id] || [] : []
  );

  const operatorAvatar = $derived(
    userProvider.user?.avatar
      ? pb.files.getURL(userProvider.user, userProvider.user.avatar)
      : Man.src
  );
  const chatAvatar = $derived(
    userProvider.chat?.avatar
      ? pb.files.getURL(userProvider.chat, userProvider.chat.avatar)
      : Thalia.src
  );

  let messageContainer: HTMLElement | null = $state(null);
  let showScrollButton = $state(false);

  $effect(() => {
    if (messages.length > 0)
      setTimeout(() => scrollToBottom(messageContainer), 100);
  });

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
          No messages yet, waiting...
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
      onclick={() => scrollToBottom(messageContainer)}
      class="p-2 rounded-full hover:cursor-pointer bg-secondary absolute bottom-6 right-1/2 translate-x-1/2 z-10"
      aria-label="Scroll to bottom"
    >
      <ChevronsDown size={20} />
    </button>
  {/if}
</div>
