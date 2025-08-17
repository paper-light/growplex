<script lang="ts">
  import { marked } from "marked";
  import DOMPurify from "dompurify";
  import { DateTime } from "luxon";
  import type { ClassValue } from "svelte/elements";

  import type { MessagesResponse } from "@/shared/models/pocketbase-types";
  import type { Sender } from "@/chat/providers/socket.svelte";
  import Man from "@/shared/assets/Man.jpg";
  interface Props {
    class?: ClassValue;
    incoming: boolean;
    msg: MessagesResponse;
  }

  const { msg, incoming, class: className = "" }: Props = $props();

  const sender: Sender | null = (msg.metadata as any)?.sender;

  // TIME
  const utcTs = DateTime.fromFormat(msg.created, "yyyy-MM-dd HH:mm:ss.SSS'Z'", {
    zone: "utc",
  });

  const localTs = utcTs.isValid ? utcTs.toLocal() : utcTs;
  const formattedTime = localTs.isValid ? localTs.toFormat("h:mm a") : "";

  const rawHtml = marked.parse(msg.content);
  const safeHtml = DOMPurify.sanitize(rawHtml as string, {
    ADD_ATTR: ["target", "rel"],
  });
</script>

<div class={["chat-group", className]}>
  <div class={incoming ? "chat chat-start" : "chat chat-end"}>
    <div class="chat-image avatar">
      <div class="size-10 rounded-full overflow-hidden">
        <img
          alt={msg.role}
          src={sender?.avatar || Man.src}
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <div class="chat-header flex items-center space-x-2">
      <span class="text-sm font-semibold">{sender?.name || sender?.id}</span>
      {#if formattedTime}
        <time datetime={msg.created} class="text-xs opacity-50">
          {formattedTime}
        </time>
      {/if}
    </div>

    <div
      class={[
        "prose chat-bubble break-words max-w-[80vw] p-2 rounded-lg overflow-hidden",
        "[&_pre]:overflow-x-hidden [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:mx-auto [&_pre]:max-w-[95%] [&_code]:whitespace-pre-wrap [&_code]:break-words [&_code]:overflow-wrap-anywhere [&_p]:break-words [&_p]:overflow-wrap-anywhere",
      ]}
      class:chat-bubble-base-200={incoming}
      class:chat-bubble-primary={!incoming}
      aria-label="Chat message"
    >
      {@html safeHtml}
    </div>

    <!-- {#if msg.status}
      <div
        class="chat-footer text-xs opacity-50"
        class:text-base-content={incoming}
        class:text-primary-content={!incoming}
  
        {msg.status}
      </div>
    {/if} -->
  </div>
</div>
