<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { debounce } from "../../../../shared/helpers/debounce";
  import TextArea from "../../../../shared/ui/lib/TextArea.svelte";
  import type { ChatsResponse } from "../../../../shared/models/pocketbase-types";
  import { chatCrud } from "../../../repositories/chat-crud";
  interface Props {
    chat: ChatsResponse | null;
    class?: ClassValue;
  }
  let { chat, class: className = "" }: Props = $props();

  const DEBOUNCE_TIME = 1.2 * 1000;

  let firstMessage = $derived(chat?.firstMessage ?? "");

  const updateFirstMessage = debounce(async (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    const newFirstMessage = target.value;

    if (newFirstMessage === chat?.firstMessage || !chat) return;

    await chatCrud.update({
      id: chat.id,
      firstMessage: newFirstMessage,
    });
  }, DEBOUNCE_TIME);
</script>

<div class={className}>
  <TextArea
    class="w-full"
    color="neutral"
    oninput={updateFirstMessage}
    bind:value={firstMessage}
    rows={4}
    placeholder="Hello! I am your AI assistant! Do you have any questions?"
  >
    <span class="font-medium">First Message</span>
  </TextArea>
</div>
