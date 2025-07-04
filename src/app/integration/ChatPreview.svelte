<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { X } from "@lucide/svelte";
  import { onDestroy, untrack } from "svelte";

  import { settingsProvider } from "../settings/settings.svelte";
  import { authProvider } from "../auth/auth.svelte";
  import { uiProvider } from "../settings/ui.svelte";
  import Chat from "../../chat/Chat.svelte";
  import { pb } from "../auth/pb";

  const currentIntegration = $derived(settingsProvider.currentIntegration);

  const agent = $derived(currentIntegration?.expand?.agent || null);
  const chat = $derived(currentIntegration?.expand?.chat || null);

  const token = $derived(authProvider.token);

  const open = $derived(uiProvider.chatPreviewOpen);
  let sidebarEl: HTMLElement | null = $state(null);

  let roomId = $state("");

  async function createRoom() {
    const room = await pb.collection("rooms").create({
      chat: chat?.id,
      status: "preview",
    });
    roomId = room.id;
    localStorage.setItem("chatRoomId", roomId);
  }

  function reloadChat() {
    chatKey = Date.now();
    if (roomId) {
      localStorage.removeItem("chatRoomId");
      pb.collection("rooms").delete(roomId);
      createRoom();
    } else {
      roomId = localStorage.getItem("chatRoomId") || "";
      if (!roomId) createRoom();
    }
  }

  let chatKey = $state(Date.now());
  $effect(() => {
    if (!chat || !agent) return;
    untrack(() => {
      reloadChat();
    });
  });

  const payload = $derived({
    username: authProvider.user?.name || "",
    roomId,
  });

  function openSidebar() {
    uiProvider.setChatPreviewOpen(true);
  }

  function closeSidebar() {
    uiProvider.setChatPreviewOpen(false);
  }

  // close on Escape
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") closeSidebar();
  }

  $effect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeydown);
    } else {
      window.removeEventListener("keydown", handleKeydown);
    }
  });

  // ensure cleanup on unmount
  onDestroy(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
</script>

<!-- Open button -->
<button
  type="button"
  class="absolute top-1/2 -right-8 -translate-y-1/2 rounded-full bg-primary hover:cursor-pointer hover:bg-base-200 transition border border-primary hover:text-primary flex flex-col items-center justify-center px-2 py-3"
  aria-label="Open sidebar"
  onclick={openSidebar}
  style="height: 260px; min-width: 30px;"
>
  {#each "CHAT-PREVIEW".split("") as letter, i}
    <span class="block text-sm font-bold" style="transform: rotate(90deg);"
      >{letter}</span
    >
  {/each}
</button>

{#if open}
  <aside
    bind:this={sidebarEl}
    class="fixed top-0 right-0 h-full w-100 bg-base-200 shadow-xl z-30"
    transition:slide={{ axis: "x" }}
    aria-label="Sidebar"
    tabindex="-1"
    onintroend={() => sidebarEl?.focus()}
  >
    <button
      type="button"
      class="btn btn-primary rounded-2xl btn-sm absolute top-4 right-16"
      aria-label="Reload chat"
      onclick={reloadChat}
    >
      RELOAD CHAT
    </button>
    <!-- Close button -->
    <button
      type="button"
      class="btn btn-sm btn-ghost btn-circle absolute top-4 right-4"
      aria-label="Close sidebar"
      onclick={closeSidebar}
    >
      <X size={20} />
    </button>

    {#key chatKey}
      {#if !agent}
        <div class="flex flex-col items-center justify-center h-full">
          <h1 class="text-2xl font-bold text-nowrap">No agent found</h1>
        </div>
      {:else if !chat}
        <div class="flex flex-col items-center justify-center h-full">
          <h1 class="text-2xl font-bold text-nowrap">No chat found</h1>
        </div>
      {:else if !token}
        <div class="flex flex-col items-center justify-center h-full">
          <h1 class="text-2xl font-bold text-nowrap">No token found</h1>
        </div>
      {:else}
        <Chat {chat} {agent} {payload} {token} />
      {/if}
    {/key}
  </aside>
{/if}
