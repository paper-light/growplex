<script lang="ts">
  import { onMount } from "svelte";

  import ThemeForward from "./ThemeForward.svelte";
  import { ChatWidgetPayloadSchema } from "../lib/models";

  interface Props {
    chatId: string;
    domain: string;
    initOpen?: boolean;
    listenTheme?: boolean;
    initTheme?: string;
  }

  const { listenTheme, chatId, domain, initTheme, initOpen }: Props = $props();

  let open = $state(initOpen);
  let iframeEl: HTMLIFrameElement | null = $state(null);
  let token: string | null = $state(null);

  let iframeSrc = $derived(
    token
      ? `${domain}/embed/chat/${chatId}?token=${encodeURIComponent(token)}&theme=${initTheme}&open=${open}`
      : `${domain}/embed/chat/${chatId}?theme=${initTheme}&open=${open}`
  );

  onMount(async () => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "chat:open") {
        open = true;
        localStorage.setItem("chat-widget-open", "true");
      }
      if (event.data.type === "chat:close") {
        open = false;
        localStorage.setItem("chat-widget-open", "false");
      }
    });

    const payloadStr = localStorage.getItem("chat-widget-payload");
    const payload = payloadStr
      ? ChatWidgetPayloadSchema.parse(JSON.parse(payloadStr))
      : null;

    const body = JSON.stringify({
      chatId,
      roomId: payload?.roomId,
      username: payload?.username,
    });

    // Auth for guest users
    const response = await fetch(`${domain}/api/chat/auth`, {
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
</script>

{#if token}
  <iframe
    allowtransparency
    title="Chat Widget"
    bind:this={iframeEl}
    style={`z-index: 9999; background-color: transparent; background: transparent; position: fixed; bottom: 0; right: 0; ${open ? "width: 400px; height: 100vh;" : "width: 64px; height: 64px;"}`}
    src={iframeSrc}
    frameborder="0"
  ></iframe>

  {#if iframeEl}
    <ThemeForward {iframeEl} {listenTheme} />
  {/if}
{/if}
