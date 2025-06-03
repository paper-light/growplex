<script lang="ts">
  import { X } from "@lucide/svelte";
  import { PUBLIC_CHAT_DOMAIN } from "astro:env/client";

  let open = $state(false);
</script>

<div class="fixed bottom-0 right-0">
  <button
    class="btn"
    onclick={() => (open = true)}
    id="chat-trigger"
    class:hidden={open}>Chat</button
  >

  <div class="bg-base-100" id="chat-container" class:hidden={!open}>
    <button onclick={() => (open = false)} id="close-chat" class="close-btn"
      ><X /></button
    >
    <iframe
      title="chat"
      id="chat-iframe"
      allowtransparency={true}
      src={`${PUBLIC_CHAT_DOMAIN}/app/embed/chat/w3981q79i86f9p4`}
    ></iframe>
  </div>
</div>
