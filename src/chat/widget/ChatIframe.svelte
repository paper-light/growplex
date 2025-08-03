<script lang="ts">
  import { onMount, tick } from "svelte";

  import { authGuest } from "@/auth/utils/auth-guest";

  import ThemeForward from "./ThemeForward.svelte";

  interface Props {
    chatId: string;
    domain: string;
    initOpen?: boolean;
    listenTheme?: boolean;
    initTheme?: string;
  }

  const { listenTheme, chatId, domain, initTheme, initOpen }: Props = $props();

  type ChatState = "closed" | "opening" | "open" | "closing";
  let openState: ChatState = $state(initOpen ? "open" : "closed");

  let iframeEl: HTMLIFrameElement | null = $state(null);
  let token: string | null = $state(null);

  let isMobile = $state(false);

  const iframeSrc = $derived.by(() => {
    if (!token) return null;
    return `${domain}/embed/chat/${chatId}?theme=${initTheme}&open=${initOpen}&token=${token}`;
  });

  onMount(async () => {
    const checkMobile = () => {
      isMobile = window.matchMedia("(max-width: 640px)").matches;
    };
    checkMobile();

    window.addEventListener("message", (event) => {
      // ON OPEN
      if (event.data.type === "chat:open") {
        openState = "opening";
        tick().then(() => {
          setTimeout(() => {
            openState = "open";
          }, 20);

          setTimeout(() => {
            localStorage.setItem("chat-widget-open", "true");
          }, 300);
        });
      }

      // ON CLOSE
      if (event.data.type === "chat:close") {
        openState = "closing";
        setTimeout(() => {
          openState = "closed";
          localStorage.setItem("chat-widget-open", "false");
        }, 300);
      }
    });

    // AUTH GUEST USER
    const payloadStr = localStorage.getItem("chat-widget-payload");
    const res = await authGuest(chatId, payloadStr || "");
    if (!res) {
      console.error("Failed to authenticate chat widget");
      localStorage.removeItem("chat-widget-payload");
      return;
    }

    localStorage.setItem("chat-widget-payload", JSON.stringify(res.payload));
    token = res.token;
  });

  // STYLES
  const iframeStyle = $derived.by(() => {
    let transition =
      openState === "opening" ? "none" : "transform 0.3s ease-in-out";
    let styles = `
    z-index: 9999;
    position: fixed;
    bottom: 0;
    right: 0;
    border-radius: 0;
    transition: ${transition};
  `;

    if (openState === "closed") {
      // Small circle button visible on bottom-right
      styles += `
      width: 64px;
      height: 64px;
      bottom: 1.25rem;
      right: 1.25rem;
      border-radius: 100%;
      transform: translateX(0);
    `;
      return styles;
    }

    // For opening, open, closing states — full height + width immediately
    styles += `
    height: 90vh;
    width: ${isMobile ? "100vw" : "400px"};
  `;

    if (openState === "opening") {
      // Start fully offscreen right, then transition in (handled by onMount)
      styles += `transform: translateX(100%);`;
    } else if (openState === "closing") {
      // Slide out to the right
      styles += `transform: translateX(100%);`;
    } else {
      // openState === "open"
      styles += `transform: translateX(0);`;
    }

    return styles;
  });
</script>

<iframe
  allowtransparency
  title="Chat Widget"
  bind:this={iframeEl}
  style={iframeStyle}
  src={iframeSrc}
  frameborder="0"
></iframe>

{#if iframeEl && listenTheme}
  <ThemeForward {iframeEl} {listenTheme} />
{/if}
