<script lang="ts">
  import { onMount } from "svelte";
  import type { ChatsResponse } from "../../../shared/models/pocketbase-types.ts";

  interface Props {
    chat: ChatsResponse;
    open?: boolean;
  }

  let { open = false, chat }: Props = $props();

  onMount(() => {
    window.addEventListener("message", (event) => {
      if (!chat.domain || event.origin !== chat.domain) return;
      if (event.data.type === "chat:open") open = true;
      if (event.data.type === "chat:close") open = false;
    });
  });
</script>

{#if open}
  <div>Embed</div>
{:else}
  <div>Embed</div>
{/if}
