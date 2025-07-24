<script lang="ts">
  import { fade } from "svelte/transition";
  import { ChevronsDown } from "@lucide/svelte";
  import { roomsProvider } from "../../providers/rooms.svelte";
  import { socketProvider } from "../../providers/socket.svelte";
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
  import { chatsProvider } from "../../providers/chats.svelte";

  const room = $derived(
    roomsProvider.integrationRooms.find(
      (r) => r.id === roomsProvider.selectedRoom?.id
    ) || null
  );
  const messages = $derived.by(() => {
    if (!room) return [];
    const history = socketProvider.histories.get(room.id);
    return history || [];
  });

  const operatorAvatar = $derived(
    userProvider.user?.avatar
      ? pb.files.getURL(userProvider.user, userProvider.user.avatar)
      : Man.src
  );
  const chatAvatar = $derived(
    chatsProvider.selectedChat?.avatar
      ? pb.files.getURL(
          chatsProvider.selectedChat,
          chatsProvider.selectedChat.avatar
        )
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
    class="flex-1 overflow-y-auto space-y-2 py-4 px-12 overscroll-contain max-w-4xl md:w-full md:mx-auto border-x border-base-300"
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
