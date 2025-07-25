<script lang="ts">
  import { onMount, untrack } from "svelte";

  import ThemeForward from "./ThemeForward.svelte";

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
  let iframeLoaded = $state(false);

  let isMobile = $state(false);

  const iframeSrc = $derived(`${domain}/embed/chat/${chatId}`);

  onMount(async () => {
    const checkMobile = () => {
      isMobile = window.matchMedia("(max-width: 640px)").matches;
    };
    checkMobile();

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
  });

  // STYLES
  const base = `
      z-index: 9999;
      position: fixed;
      background: transparent;
      background-color: transparent;
      border: none;
      bottom: 0;
      right: 0;
    `;
  const iframeStyle = $derived.by(() => {
    if (!open) {
      return `
      ${base}
      width: 64px;
      height: 64px;
    `;
    }

    if (isMobile) {
      return `
      ${base}
      width: 100vw;
      height: 100vh;
    `;
    }

    return `
    ${base}
    width: 400px;
    height: 100vh;
  `;
  });

  $effect(() => {
    if (!iframeLoaded) return;

    untrack(() => {
      // INIT THEME
      iframeEl!.contentWindow?.postMessage(
        { type: "theme-change", newTheme: initTheme },
        "*"
      );

      // INIT OPEN STATE
      if (open) {
        iframeEl!.contentWindow?.postMessage({ type: "chat:open" }, "*");
      } else {
        iframeEl!.contentWindow?.postMessage({ type: "chat:close" }, "*");
      }
    });
  });
</script>

<iframe
  onload={() => (iframeLoaded = true)}
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
