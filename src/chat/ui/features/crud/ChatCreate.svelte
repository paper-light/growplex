<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Button from "@/shared/ui/Button.svelte";
  import type { ChatsResponse } from "@/shared/models/pocketbase-types";

  import { chatCrud } from "@/chat/repositories/chat-crud";

  interface Props {
    projectId: string;
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
    color?: "primary" | "neutral" | "error";
    style?: "outline" | "ghost";
    afterCreate?: (chat: ChatsResponse) => void;
  }

  let {
    projectId,
    class: className = "",
    size = "md",
    afterCreate,
    color = "primary",
    style = "outline",
  }: Props = $props();
</script>

<Button
  class={className}
  onclick={async () => {
    if (!projectId) return;

    const newchat = await chatCrud.create({
      project: projectId,
    });

    afterCreate?.(newchat);
  }}
  {size}
  {color}
  {style}
>
  + New chat
</Button>
