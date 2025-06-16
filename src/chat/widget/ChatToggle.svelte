<script lang="ts">
  import { fade } from "svelte/transition"
  // import { MessageCircle } from "@lucide/svelte";

  interface Props {
    isOpen: boolean;
    onToggle: () => void;
  }

  let { isOpen, onToggle }: Props = $props();
</script>

{#if !isOpen}
  <button
    class="toggle"
    aria-label="Open chat"
    aria-expanded={isOpen}
    onclick={onToggle}
    transition:fade={{ duration: 100 }}
  >
  </button>
{/if}

<style>
  .toggle {
    background: var(--chat-widget-primary);
    border: 2px solid var(--chat-widget-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    position: fixed;
    bottom: 2rem;
    right: 1rem;
    width: 3.5rem;
    height: 3.5rem;
    cursor: pointer;
    z-index: 10000;
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }
  .toggle svg {
    width: 2rem;
    height: 2rem;
    stroke: #fff;
    transition: stroke 0.2s ease;
  }
  .toggle:hover {
    background: transparent;
  }
  .toggle:hover svg {
    stroke: var(--chat-widget-primary);
  }
  @media (min-width: 768px) {
    .toggle {
      width: 4rem;
      height: 4rem;
    }
  }
</style>
