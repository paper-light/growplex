<script lang="ts">
  import { onDestroy, onMount, untrack } from "svelte";
  import { MessageCircle, X } from "@lucide/svelte";

  import type {
    ChatsResponse,
    AgentsResponse,
  } from "../../../shared/models/pocketbase-types.ts";
  import { socketProvider } from "../../providers/socket.svelte";
  import Button from "../../../shared/ui/lib/Button.svelte";
  import { parseJwtPayload } from "../../../auth/utils/parse-jwt";
  import { ChatWidgetPayloadSchema } from "../../lib/models";

  import Chat from "./Chat.svelte";

  interface Props {
    agent: AgentsResponse;
    chat: ChatsResponse;

    initTheme?: string;
    initOpen?: boolean;
  }

  let { chat, agent, initTheme, initOpen }: Props = $props();

  let token: string | null = $state(null);
  let open = $state(initOpen || false);

  let closing = $state(false);
  let opening = $state(false);

  let theme = $state(initTheme || (chat.theme as any)?.production || "light");

  const { roomId, username } = $derived.by(() => {
    if (!token) return { roomId: null, username: null };
    const parsed = parseJwtPayload(token);
    if (!parsed) throw new Error("Invalid token: unable to parse JWT payload");
    return ChatWidgetPayloadSchema.parse(parsed);
  });

  let root: HTMLElement | null = $state(null);

  $effect(() => {
    if (!token) return;

    untrack(() => {
      socketProvider.connect(token!);
    });
  });

  onMount(async () => {
    console.log("onMount EMBED");

    window.addEventListener("message", (event) => {
      const { type, ...payload } = event.data || {};
      if (type === "theme-change") {
        theme = payload.newTheme;
      }
    });

    // AUTH GUEST USER
    const payloadStr = localStorage.getItem("chat-widget-payload");
    const payload = payloadStr
      ? ChatWidgetPayloadSchema.parse(JSON.parse(payloadStr))
      : null;

    const body = JSON.stringify({
      chatId: chat.id,
      roomId: payload?.roomId,
      username: payload?.username,
    });

    // Auth for guest users
    const response = await fetch(`/api/chat/auth`, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 200) {
      console.error("Failed to authenticate chat widget");
      return;
    }

    const res = await response.json();
    localStorage.setItem("chat-widget-payload", JSON.stringify(res.payload));
    token = res.token;
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

    {#if token && roomId && username}
      <Chat {chat} {agent} {theme} {root} {roomId} {username} />
    {/if}
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
