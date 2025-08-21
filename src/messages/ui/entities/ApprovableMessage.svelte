<script lang="ts">
  import type { MessagesResponse } from "@/shared/models/pocketbase-types";
  import Button from "@/shared/ui/Button.svelte";

  import { approveMessage } from "@/messages/utils/approve";
  import { rejectMessage } from "@/messages/utils/reject";

  interface Props {
    msg: MessagesResponse;
  }

  const { msg }: Props = $props();

  const maxWaitingSeconds = (msg.metadata as any)?.waitingSeconds;
  let waitingSeconds = $state(maxWaitingSeconds || 0);
  let progress = $derived(100 - (waitingSeconds / maxWaitingSeconds) * 100);

  const args = $derived((msg.metadata as any)?.args);
  const loading = $derived((msg.metadata as any)?.loading);
  const approved = $derived((msg.metadata as any)?.approved);
  const rejected = $derived((msg.metadata as any)?.rejected);

  const { question, waitingText, rows } = $derived.by(() => {
    if (!args) {
      return {
        question: "Process?",
        rows: [],
        waitingText: "Processing...",
      };
    }

    switch (msg.event) {
      case "update-integration":
        return {
          question: "Update integration?",
          rows: Object.entries(args),
          waitingText: "Updating integration...",
        };
      case "update-integration-chat":
        return {
          question: "Update chat?",
          rows: Object.entries(args),
          waitingText: "Updating chat...",
        };
      case "update-integration-agent":
        return {
          question: "Update agent?",
          rows: Object.entries(args),
          waitingText: "Updating agent...",
        };
      default:
        return {
          question: "Process?",
          rows: [],
          waitingText: "Processing...",
        };
    }
  });

  const data = $derived(msg.content ? JSON.parse(msg.content) : null);
  const success = $derived(data?.success);
  const content = $derived(data?.content);

  $effect(() => {
    if (waitingSeconds && loading) {
      const interval = setInterval(() => {
        waitingSeconds--;
      }, 1000);

      return () => clearInterval(interval);
    }
  });
</script>

{#if !approved && !rejected}
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-center gap-4">
      <div
        class="radial-progress"
        style={`--value:${progress}; --size:3rem; --thickness: 4px;`}
        aria-valuenow={progress}
        role="progressbar"
      >
        {waitingSeconds}s
      </div>

      <p class="font-semibold">
        {question}
      </p>
    </div>

    {#if rows.length > 0}
      <ul class="list-none">
        <li class="divider mb-2"></li>
        {#each rows as [key, value]}
          <li>
            <span class="font-semibold">{key}:</span>
            <span>{JSON.stringify(value)}</span>
          </li>
        {/each}
        <li class="divider mt-2"></li>
      </ul>
    {/if}

    <div class="flex justify-end gap-2">
      <Button
        onclick={() => approveMessage(msg.id)}
        style="outline"
        size="sm"
        color="success">Approve</Button
      >
      <Button
        onclick={() => rejectMessage(msg.id)}
        style="outline"
        size="sm"
        color="error">Reject</Button
      >
    </div>
  </div>
{:else if loading}
  <div class="chat-group">
    <div class="chat chat-start">
      <div class="chat-header flex items-center space-x-2">
        <span class="text-sm font-semibold">{msg.role}</span>
      </div>
    </div>
  </div>
{/if}
