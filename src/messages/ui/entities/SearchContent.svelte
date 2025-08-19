<script lang="ts">
  // import { Check, X } from "@lucide/svelte";

  import type { MessagesResponse } from "@/shared/models/pocketbase-types";

  interface Props {
    msg: MessagesResponse;
  }

  const { msg }: Props = $props();

  const loading = $derived((msg.metadata as any)?.loading);
  const data = $derived(msg.content ? JSON.parse(msg.content) : null);
  const success = $derived(data?.success);
  const content = $derived(data?.content);
</script>

{#if loading}
  <span class="loading loading-spinner loading-lg text-info"></span>
  <span class="">Searching...</span>
{:else if success}
  <!-- <Check class="size-4 text-success" /> -->
  <span class="">
    {content}
  </span>
{:else}
  <!-- <X class="size-4 text-error" /> -->
  <span class="">
    {content}
  </span>
{/if}
