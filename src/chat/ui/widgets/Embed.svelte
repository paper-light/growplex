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
  }

  let { chat, agent }: Props = $props();

  let token: string | null = $state(null);
  let open = $state(false);
  let theme = $state((chat.theme as any)?.production || "light");

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
      } else if (type === "chat:open") {
        open = true;
      } else if (type === "chat:close") {
        open = false;
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
    window.parent.postMessage({ type: "chat:open" }, "*");
    open = true;
  }

  async function closeChat() {
    open = false;
    await new Promise((resolve) => setTimeout(resolve, 300));
    window.parent.postMessage({ type: "chat:close" }, "*");
  }
</script>

<div
  data-theme={theme}
  class="absolute w-full h-full z-20 bg-transparent"
  bind:this={root}
>
  <!-- FAB Button -->
  <div
    class="fixed bottom-0 right-0 transition-all duration-300 bg-transparent"
    style={`${open ? "opacity: 0;" : "opacity: 1;"}`}
  >
    <Button size="xl" color="primary" onclick={openChat} circle>
      <MessageCircle size={32} />
    </Button>
  </div>

  <!-- Slide-In Chat Panel -->
  <div
    class="fixed top-0 right-0 h-full w-full z-10 shadow-lg transform transition-transform duration-300 ease-in-out overflow-hidden inset-0 bg-transparent"
    style={`${open ? "transform: translateX(0);" : "transform: translateX(100%);"}`}
  >
    <!-- Close Button -->
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
</div>
