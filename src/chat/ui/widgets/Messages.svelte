<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { fade } from "svelte/transition";
  import { ChevronsDown } from "@lucide/svelte";

  import Thalia from "@/shared/assets/Thalia.jpg";
  import Man from "@/shared/assets/Man.jpg";
  import Button from "@/shared/ui/lib/Button.svelte";
  import { scrollToBottom } from "@/shared/actions/scroll-bottom";
  import {
    MessagesEventOptions,
    MessagesRoleOptions,
    type MessagesResponse,
  } from "@/shared/models/pocketbase-types";

  import EventMessage from "@/chat/ui/entities/EventMessage.svelte";
  import ChatMessage from "@/chat/ui/entities/Message.svelte";

  interface Props {
    class?: ClassValue;
    messages: MessagesResponse[];
    mode: "operator" | "guest";
  }

  let { messages, class: className, mode }: Props = $props();

  let messagesContainer: HTMLDivElement | null = $state(null);
  let showScrollButton = $state(false);

  $effect(() => {
    if (messages.length > 0)
      setTimeout(() => scrollToBottom(messagesContainer), 100);
  });

  function onscroll() {
    if (!messagesContainer) return;
    const { scrollTop, clientHeight, scrollHeight } = messagesContainer;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
    showScrollButton = !atBottom;
  }

  function getAvatar(msg: MessagesResponse) {
    if ((msg.metadata as any)?.avatar) return (msg.metadata as any).avatar;

    if (msg.role === MessagesRoleOptions.assistant) {
      return Thalia.src;
    } else if (msg.role === MessagesRoleOptions.operator) {
      return Man.src;
    }
    return Man.src;
  }
</script>

<div class={[className, "relative h-full bg-base-100"]}>
  <div
    bind:this={messagesContainer}
    {onscroll}
    class={["h-full overflow-y-auto space-y-2 overscroll-contain px-2 py-1"]}
  >
    {#if messages.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-center">
        <div class="text-6xl mb-4">💬</div>
        <p class="text-base-content/70 text-lg font-medium">
          No messages yet, waiting...
        </p>
      </div>
    {:else}
      {#each messages as msg (msg.id)}
        {@const avatar = getAvatar(msg)}
        {@const incoming = (() => {
          if (mode === "operator")
            return msg.role !== MessagesRoleOptions.operator;
          if (mode === "guest") return msg.role !== MessagesRoleOptions.user;
          return false;
        })()}

        {#if msg.event && msg.event !== MessagesEventOptions.message}
          <EventMessage type={msg.event} />
        {:else}
          <ChatMessage {msg} {avatar} {incoming} />
        {/if}
      {/each}
    {/if}

    {#if showScrollButton}
      <div
        class="absolute bottom-6 right-1/2 translate-x-1/2 z-10"
        transition:fade
      >
        <Button
          circle
          color="secondary"
          size="sm"
          onclick={() => scrollToBottom(messagesContainer)}
        >
          <ChevronsDown size={20} />
        </Button>
      </div>
    {/if}
  </div>
</div>
