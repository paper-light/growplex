<script lang="ts">
  import { X } from "@lucide/svelte";
  import { untrack } from "svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { uiProvider } from "../../../user/ui.svelte";
  import Chat from "./Chat.svelte";
  import { roomsProvider } from "../../providers/rooms.svelte";
  import Button from "../../../shared/ui/lib/Button.svelte";

  import { agentsProvider } from "../../../agent/providers/agents.svelte";
  import { chatsProvider } from "../../providers/chats.svelte";
  import { roomCrud } from "../../repositories/room-crud";
  import { socketProvider } from "../../providers/socket.svelte";

  interface Props {
    block?: boolean;
  }

  let { block = false }: Props = $props();

  const agent = $derived(agentsProvider.selectedIntegrationAgent || null);
  const chat = $derived(chatsProvider.selectedIntegrationChat || null);
  const token = $derived(userProvider.token);

  const room = $derived(
    chat ? roomsProvider.previewRoomMap.get(chat.id) : null
  );

  const selectedTheme = $derived(uiProvider.selectedChatTheme);
  const open = $derived(uiProvider.chatPreviewOpen);

  let sidebarEl: HTMLElement | null = $state(null);

  const payload = $derived({
    username: userProvider.user?.name || "",
    roomId: room?.id || "",
  });

  $effect(() => {
    if (!chat || !agent) return;

    untrack(async () => {
      if (room) {
        socketProvider.leaveRoom(room.id);
        await roomCrud.delete(room.id);
      }
    });
  });
  const errors = $derived.by(() => {
    const errs = [];
    if (!agent) errs.push("No agent found");
    if (!chat) errs.push("No chat found");
    if (!token) errs.push("No token found");
    if (!room) errs.push("No room found");
    return errs;
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") uiProvider.setChatPreviewOpen(false);
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
    onclick={() => uiProvider.setChatPreviewOpen(true)}
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
  {#if !block}
    <div
      class="cursor-pointer z-100 absolute top-2 right-2"
      data-theme={selectedTheme}
    >
      <Button
        size="sm"
        circle
        onclick={() => uiProvider.setChatPreviewOpen(false)}
        style="soft"
      >
        <X class="text-neutral" size={24} />
      </Button>
    </div>
  {/if}

  <div class="flex-1 min-h-0 overflow-hidden">
    {#key chat}
      {#if errors.length > 0}
        <div class="flex flex-col items-center justify-center h-full gap-5">
          {#each errors as error}
            <h1 class="text-2xl font-bold text-nowrap text-error">{error}</h1>
          {/each}
        </div>
      {:else if chat && agent && token && room}
        <Chat {chat} {agent} {payload} {token} initTheme={selectedTheme} />
      {:else}
        <div class="flex flex-col items-center justify-center h-full gap-5">
          WoW
        </div>
      {/if}
    {/key}
  </div>
</aside>
