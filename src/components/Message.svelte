<script lang="ts">
  import type { Snippet } from "svelte";
  import { DateTime } from "luxon";

  interface Props {
    children: Snippet;
    incoming?: boolean;
    name?: string;
    timestamp?: DateTime;
    status?: string;
    avatarUrl?: string;
  }

  const {
    incoming = false,
    name = incoming ? "Assistant" : "You",
    timestamp,
    status = "",
    avatarUrl = "https://i.pravatar.cc/40?img=5",
    children,
  }: Props = $props();

  const formattedTime = timestamp ? timestamp.toFormat("h:mm a") : "";
</script>

<div class={["chat", incoming ? "chat-start" : "chat-end"]}>
  <div class="chat-image avatar">
    <div class="w-10 rounded-full">
      <img alt="avatar" src={avatarUrl} />
    </div>
  </div>

  <div>
    <div class="chat-header">
      <span
        class={["text-sm font-semibold", incoming ? "text-base-content" : ""]}
      >
        {name}
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
      {@render children()}
    </div>

    {#if status}
      <div
        class={[
          "chat-footer opacity-50",
          incoming ? "text-base-content" : "text-primary-content",
        ]}
      >
        {status}
      </div>
    {/if}
  </div>
</div>
