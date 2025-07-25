<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { MessageCircle, X } from "@lucide/svelte";
  import { fade } from "svelte/transition";

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
    token: string;
    open?: boolean;
    initTheme?: string;
  }

  let { open = false, chat, agent, token, initTheme }: Props = $props();

  const { roomId, username } = $derived.by(() => {
    const parsed = parseJwtPayload(token);
    if (!parsed) {
      throw new Error("Invalid token: unable to parse JWT payload");
    }
    return ChatWidgetPayloadSchema.parse(parsed);
  });

  let root: HTMLElement | null = $state(null);

  let theme = $state(initTheme || (chat.theme as any)?.production || "light");

  onMount(() => {
    console.log("onMount EMBED");

    window.addEventListener("message", (event) => {
      // if (!chat.domain || event.origin !== chat.domain) return;

      const { type, ...payload } = event.data || {};
      if (type === "theme-change") {
        theme = payload.newTheme;
      }
    });

    socketProvider.connect(token);
    return () => {
      socketProvider.disconnect();
    };
  });

  function openChat() {
    open = true;
    window.parent.postMessage({ type: "chat:open" }, "*");
  }

  function closeChat() {
    open = false;
    window.parent.postMessage({ type: "chat:close" }, "*");
  }
</script>

<div
  data-theme={theme}
  class="absolute inset-0 w-full h-full bg-transparent"
  style="background: transparent;"
  bind:this={root}
>
  {#if !open}
    <div
      class="w-full h-full flex items-center justify-center bg-transparent"
      style="background: transparent;"
      transition:fade={{ duration: 100 }}
    >
      <Button size="lg" color="primary" onclick={openChat} circle>
        <MessageCircle size={36} />
      </Button>
    </div>
  {:else}
    <div
      class="relative w-full h-full bg-transparent"
      style="background: transparent;"
    >
      <Button
        class="absolute top-2 right-2 z-10"
        onclick={closeChat}
        style="ghost"
        color="neutral"
        size="sm"
        circle
      >
        <X size={22} />
      </Button>

      <Chat {chat} {agent} {theme} {root} {roomId} {username} />
    </div>
  {/if}
</div>
