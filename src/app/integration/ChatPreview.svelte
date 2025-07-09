<script lang="ts">
  import { slide } from "svelte/transition";
  import { X } from "@lucide/svelte";
  import { onMount, untrack } from "svelte";

  import { settingsProvider } from "../settings/settings.svelte";
  import { authProvider } from "../auth/auth.svelte";
  import { uiProvider } from "../settings/ui.svelte";
  import Chat from "../../chat/Chat.svelte";
  import { pb } from "../../shared/lib/pb";
  import { socketProvider } from "../chat/socket.svelte";

  const currentIntegration = $derived(settingsProvider.currentIntegration);

  const agent = $derived(currentIntegration?.expand?.agent || null);
  const chat = $derived(currentIntegration?.expand?.chat || null);
  const token = $derived(authProvider.token);

  const open = $derived(uiProvider.chatPreviewOpen);
  let sidebarEl: HTMLElement | null = $state(null);

  let roomId = $state(localStorage.getItem("chatRoomId") || "");

  async function createRoom() {
    await socketProvider.isConnectedPromise;

    const room = await pb.collection("rooms").create({
      chat: chat?.id,
      status: "preview",
    });
    roomId = room.id;
    localStorage.setItem("chatRoomId", roomId);
  }

  async function reloadChat() {
    await pb.collection("rooms").delete(roomId);
    localStorage.removeItem("chatRoomId");
    await createRoom();
  }

  onMount(() => {
    if (!roomId) createRoom();

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
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
</script>

<!-- Open button -->
<button
  type="button"
  class="absolute top-1/2 -right-1 -translate-y-1/2 rounded-full bg-primary hover:cursor-pointer hover:bg-base-200 transition border border-primary hover:text-primary flex flex-col items-center justify-center px-2 py-3"
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

<aside
  bind:this={sidebarEl}
  class="absolute top-0 right-0 h-full w-screen md:w-100 bg-base-200 shadow-xl z-100 flex flex-col transition-transform duration-300 ease-in-out"
  aria-label="Sidebar"
  tabindex="-1"
  style={`transform: translateX(${open ? "0" : "100%"})`}
  onintroend={() => sidebarEl?.focus()}
>
  <div
    class="flex justify-between items-center px-4 py-1 border-b border-base-300"
  >
    <button
      type="button"
      class="btn btn-primary btn-sm rounded-xl btn-outline"
      aria-label="Reload chat"
      onclick={reloadChat}
    >
      RELOAD CHAT
    </button>
    <button
      type="button"
      class="btn btn-sm btn-ghost btn-circle"
      aria-label="Close sidebar"
      onclick={closeSidebar}
    >
      <X size={20} />
    </button>
  </div>
  <div class="flex-1 overflow-y-auto">
    {#key [roomId, agent, chat, token]}
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
  </div>
</aside>
