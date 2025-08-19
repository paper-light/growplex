<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { fade } from "svelte/transition";
  import { ChevronsDown } from "@lucide/svelte";

  import Button from "@/shared/ui/Button.svelte";
  import { scrollToBottom } from "@/shared/actions/scroll-bottom";
  import {
    MessagesRoleOptions,
    type MessagesResponse,
    type AgentsResponse,
    type UsersResponse,
  } from "@/shared/models/pocketbase-types";
  import { type Sender } from "@/chat/providers/socket.svelte";

  import ChatMessage from "@/messages/ui/entities/Message.svelte";
  import Thalia from "@/shared/assets/Thalia.jpg";
  import { pb } from "@/shared/lib/pb";
  import Man from "@/shared/assets/Man.jpg";

  interface Props {
    class?: ClassValue;
    messages: MessagesResponse[];
    agents: AgentsResponse[];
    operators: UsersResponse[];
    sender: Sender;
  }

  let {
    messages,
    class: className,
    sender,
    agents,
    operators,
  }: Props = $props();

  const msgsWithSender = $derived(
    messages.map((msg) => ({
      ...msg,
      metadata: {
        ...(msg.metadata || {}),
        sender: getSender(msg),
      },
    }))
  );

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

  function getSender(msg: MessagesResponse) {
    if (
      (msg.role === "user" && sender.role === "guest") ||
      msg.role === sender.role
    ) {
      return sender;
    } else if (["assistant", "tool"].includes(msg.role)) {
      const agent = agents.find((a) => a.id === msg.sentBy);
      const avatar = agent?.avatar
        ? pb.files.getURL(agent, agent.avatar)
        : Thalia.src;
      return {
        id: agent?.id || "",
        avatar,
        name: agent?.name || agent?.id || "Agent",
        role: "assistant",
      };
    } else if (msg.role === "operator") {
      const operator = operators.find((o) => o.id === msg.sentBy);
      const avatar = operator?.avatar
        ? pb.files.getURL(operator, operator.avatar)
        : Man.src;
      return {
        id: operator?.id || "",
        avatar,
        name: operator?.name || operator?.id || "Operator",
        role: "operator",
      };
    }
    return null;
  }

  function isIncoming(msg: MessagesResponse) {
    if (sender.role === "operator")
      return msg.role !== MessagesRoleOptions.operator;
    if (sender.role === "guest") return msg.role !== MessagesRoleOptions.user;
    return false;
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
      {#each msgsWithSender as msg (msg)}
        {@const incoming = isIncoming(msg)}
        <ChatMessage {msg} {incoming} />
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
