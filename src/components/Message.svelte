<script lang="ts">
  import { DateTime } from "luxon";
  import { z } from "zod";
  import type { ChatMessageSchema } from "@/models/chat";
  import { Bot, ChefHat, Smile } from "@lucide/svelte";

  interface Props {
    msg: z.infer<typeof ChatMessageSchema>;
  }

  const { msg }: Props = $props();

  // TIME
  const timestamp = DateTime.fromFormat(
    msg.created,
    "yyyy-MM-dd HH:mm:ss.SSS'Z'",
    { zone: "utc" }
  );
  const formattedTime = timestamp ? timestamp.toFormat("h:mm a") : "";

  const incoming = $derived(msg.role !== "user");
</script>

<div class={["chat", incoming ? "chat-start" : "chat-end"]}>
  <div class="chat-image avatar">
    <div class="w-10 rounded-full">
      {#if msg.role === "assistant"}
        <Bot />
      {:else if msg.role === "operator"}
        <ChefHat />
      {:else}
        <Smile />
      {/if}
    </div>
  </div>

  <div>
    <div class="chat-header">
      <span
        class={["text-sm font-semibold", incoming ? "text-base-content" : ""]}
      >
        {msg.sentBy}
      </span>
      {#if formattedTime}
        <time class="text-xs opacity-50">{formattedTime}</time>
      {/if}
    </div>

    <div
      class={[
        "chat-bubble max-w-[60vw]",
        incoming ? "chat-bubble-base-200" : "chat-bubble-primary",
      ]}
    >
      {msg.content}
    </div>

    <!-- {#if status}
      <div
        class={[
          "chat-footer opacity-50",
          incoming ? "text-base-content" : "text-primary-content",
        ]}
      >
        {status}
      </div>
    {/if} -->
  </div>
</div>
