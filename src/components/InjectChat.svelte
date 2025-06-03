<script lang="ts">
  import { X, MessageCircle } from "@lucide/svelte";
  import { PUBLIC_CHAT_DOMAIN } from "astro:env/client";
  import { fly } from "svelte/transition";

  let open = $state(false);
</script>

<div class="fixed bottom-0 right-0 flex flex-col z-10">
  <div
    class="bg-base-100 mb-2 md:mr-18"
    id="chat-container"
    class:hidden={!open}
  >
    <iframe
      class="w-screen h-[500px] md:w-[448px] md:h-[580px] rounded-lg shadow-lg border border-secondary"
      title="chat"
      id="chat-iframe"
      allowtransparency={true}
      src={`${PUBLIC_CHAT_DOMAIN}/app/embed/chat/w3981q79i86f9p4`}
    ></iframe>
  </div>

  <button
    class="btn btn-secondary btn-outline btn-xl btn-circle mb-10 mr-4 border-2 self-end"
    onclick={() => (open = !open)}
    id="chat-trigger"
  >
    {#if open}
      <X size={32} />
    {:else}
      <MessageCircle size={32} />
    {/if}
  </button>
</div>
