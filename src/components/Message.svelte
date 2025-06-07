<script lang="ts">
  import { marked } from "marked";
  import DOMPurify from "dompurify";
  import { DateTime } from "luxon";
  import { z } from "zod";
  import type { ChatMessageSchema } from "@/models/chat";
  import { Bot, ChefHat, Smile } from "@lucide/svelte";

  interface Props {
    msg: z.infer<typeof ChatMessageSchema>;
  }

  const { msg }: Props = $props();

  // TIME
  const utcTs = DateTime.fromFormat(msg.created, "yyyy-MM-dd HH:mm:ss.SSS'Z'", {
    zone: "utc",
  });

  const localTs = utcTs.isValid ? utcTs.toLocal() : utcTs;

  const formattedTime = localTs.isValid ? localTs.toFormat("h:mm a") : "";

  const incoming = $derived(msg.role !== "user");

  const rawHtml = marked.parse(msg.content);
  const safeHtml = DOMPurify.sanitize(rawHtml as string, {
    ADD_ATTR: ["target", "rel"],
  });
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
        "prose chat-bubble max-w-[80vw]",
        incoming ? "chat-bubble-base-200" : "chat-bubble-primary",
      ]}
    >
      {@html safeHtml}
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
