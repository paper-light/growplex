<script lang="ts">
  import { X } from "@lucide/svelte";
  import { onMount } from "svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { uiProvider } from "../../../user/ui.svelte";
  import Chat from "./Chat.svelte";
  import { pb } from "../../../shared/lib/pb";
  import { socketProvider } from "../../provider/socket.svelte";
  import { settingsProvider } from "../../../user/settings.svelte";
  interface Props {
    block?: boolean;
  }

  let { block = false }: Props = $props();

  const agent = $derived(userProvider.agent || null);
  const chat = $derived(userProvider.chat || null);
  const token = $derived(userProvider.token);

  const open = $derived(uiProvider.chatPreviewOpen);
  let sidebarEl: HTMLElement | null = $state(null);

  let roomId = $state(
    typeof window !== "undefined"
      ? localStorage.getItem("chatRoomId") || ""
      : ""
  );

  const payload = $derived({
    username: userProvider.user?.name || "",
    roomId,
  });

  async function createRoom() {
    await socketProvider.onlinePromise;

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

    if (roomId) settingsProvider.setRoom(roomId);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  // Collect all errors before rendering Chat
  const errors = $derived.by(() => {
    const errs = [];
    if (!agent) errs.push("No agent found");
    if (!chat) errs.push("No chat found");
    if (!token) errs.push("No token found");
    return errs;
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
    if (open && !block) {
      window.addEventListener("keydown", handleKeydown);
    } else {
      window.removeEventListener("keydown", handleKeydown);
    }
  });
</script>

<!-- Open button -->
{#if !block}
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
{/if}

<aside
  bind:this={sidebarEl}
  class={[
    "bg-base-200 shadow-xl flex flex-col",
    block
      ? "w-full h-full min-h-0"
      : "absolute top-0 right-0 w-screen md:max-w-100 z-100 transition-transform duration-300 ease-in-out h-full",
  ]}
  aria-label="Sidebar"
  tabindex="-1"
  style={!block
    ? `transform: translateX(${open ? "0" : "100%"})`
    : block
      ? "height: 100%; max-height: 100%;"
      : undefined}
  onintroend={() => sidebarEl?.focus()}
>
  <div
    class="flex justify-between items-center px-4 py-1 border-b border-base-300 flex-shrink-0"
  >
    <div>
      <button
        type="button"
        class="btn btn-primary btn-sm rounded-xl btn-outline"
        aria-label="Reload chat"
        onclick={reloadChat}
      >
        Reload Chat
      </button>
      <button
        type="button"
        class="btn btn-primary btn-sm rounded-xl btn-outline"
        aria-label="Reload chat"
        onclick={() => {}}
      >
        Connect!
      </button>
    </div>
    {#if !block}
      <button
        type="button"
        class="btn btn-sm btn-ghost btn-circle"
        aria-label="Close sidebar"
        onclick={closeSidebar}
      >
        <X size={20} />
      </button>
    {/if}
  </div>
  <div class="flex-1 min-h-0 overflow-hidden">
    {#key [roomId, agent, chat, token]}
      {#if errors.length > 0}
        <div class="flex flex-col items-center justify-center h-full gap-5">
          {#each errors as error}
            <h1 class="text-2xl font-bold text-nowrap text-error">{error}</h1>
          {/each}
        </div>
      {:else if chat && agent && token}
        <Chat {chat} {agent} {payload} {token} initTheme="" />
      {/if}
    {/key}
  </div>
</aside>
