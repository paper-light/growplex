<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { MessageCircle, X } from "@lucide/svelte";

  import type {
    ChatsResponse,
    AgentsResponse,
    RoomsResponse,
    UsersResponse,
  } from "@/shared/models/pocketbase-types.ts";
  import { socketProvider } from "@/chat/providers/socket.svelte";
  import Button from "@/shared/ui/Button.svelte";

  import Chat from "@/chat/ui/widgets/Chat.svelte";

  interface Props {
    user: UsersResponse | { name: string };
    room: RoomsResponse;
    agent: AgentsResponse;
    chat: ChatsResponse;
    token: string;

    initTheme?: string;
    initOpen?: boolean;
  }

  let { chat, agent, user, room, token, initTheme, initOpen }: Props = $props();

  let open = $state(initOpen || false);

  let closing = $state(false);
  let opening = $state(false);

  let theme = $state(initTheme || (chat.theme as any)?.production || "light");

  let root: HTMLElement | null = $state(null);

  onMount(() => {
    if (!token) return;
    socketProvider.connect(token);
  });

  onMount(async () => {
    console.log("onMount EMBED");

    window.addEventListener("message", (event) => {
      const { type, ...payload } = event.data || {};
      if (type === "theme-change") {
        theme = payload.newTheme;
      }
    });
  });

  onDestroy(() => {
    socketProvider.disconnect();
  });

  async function openChat() {
    opening = true;
    window.parent.postMessage({ type: "chat:open" }, "*");

    await new Promise((resolve) => setTimeout(resolve, 300));

    open = true;
    opening = false;
  }

  async function closeChat() {
    closing = true;
    window.parent.postMessage({ type: "chat:close" }, "*");

    await new Promise((resolve) => setTimeout(resolve, 300));

    open = false;
    closing = false;
  }
</script>

<div
  data-theme={theme}
  class="absolute w-full h-full z-20 bg-transparent"
  bind:this={root}
>
  <div
    class="fixed top-0 right-0 h-full w-full shadow-lg overflow-hidden inset-0 border border-base-300 bg-transparent"
  >
    <Button
      class="absolute top-2 right-2 z-20"
      onclick={closeChat}
      style="ghost"
      color="neutral"
      size="sm"
      circle
    >
      <X size={22} />
    </Button>

    <Chat {chat} {agent} {theme} {root} {room} {user} />
  </div>

  <!-- FAB Button -->
  {#if !open && !opening && !closing}
    <div class="fixed bottom-0 right-0">
      <Button class="size-16" color="primary" onclick={openChat} circle>
        <MessageCircle size={32} />
      </Button>
    </div>
  {/if}
</div>
