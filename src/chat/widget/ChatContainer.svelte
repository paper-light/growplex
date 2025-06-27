<script lang="ts">
  import { X } from "@lucide/svelte";
  import ThemeForward from "./ThemeForward.svelte";

  interface Props {
    id: string;
    isOpen: boolean;
    domain: string;
    onClose: () => void;
  }

  let { id, isOpen, domain, onClose }: Props = $props();
  let iframeEl: HTMLIFrameElement | null = $state(null);

  // Get the JWT token from sessionStorage
  let token = $state(
    typeof window !== "undefined"
      ? sessionStorage.getItem("chat-widget-token")
      : null
  );
  let iframeSrc = $derived(
    token
      ? `${domain}/embed/chat/${id}?token=${encodeURIComponent(token)}`
      : `${domain}/embed/chat/${id}`
  );
</script>

<aside
  class="container {isOpen ? 'open' : ''}"
  onclick={(e) => e.stopPropagation()}
>
  <!-- always-visible close button -->
  <button class="close-btn" aria-label="Close chat" onclick={onClose}>
    <X size={20} />
  </button>

  <iframe
    bind:this={iframeEl}
    class="iframe"
    src={iframeSrc}
    title="Chat"
    allowtransparency={true}
  />
</aside>

{#if iframeEl}
  <ThemeForward {iframeEl} />
{/if}

<style>
  .container {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 400px;
    border: 1px solid #ccc;
    border-radius: 8px 0 0 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    background: #fff;
    overflow: hidden;
    z-index: 9999;
    /* start hidden off-screen */
    transform: translateX(100%);
    transition: transform 300ms ease;
  }
  .container.open {
    /* slide into view */
    transform: translateX(0);
  }
  @media (max-width: 767px) {
    .container {
      width: 100vw;
      height: 100vh;
    }
  }
  .iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  }
  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    z-index: 10001;
  }
</style>
