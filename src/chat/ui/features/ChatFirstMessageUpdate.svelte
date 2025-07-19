<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { userProvider } from "../../../user/user.svelte";
  import { debounce } from "../../../shared/helpers/debounce";
  import TextArea from "../../../shared/ui/lib/TextArea.svelte";

  interface Props {
    class?: ClassValue;
  }
  let { class: className = "" }: Props = $props();

  const DEBOUNCE_TIME = 1.2 * 1000;

  const currentChat = $derived(userProvider.chat);

  let firstMessage = $derived(currentChat?.firstMessage ?? "");

  const updateFirstMessage = debounce(async (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    const newFirstMessage = target.value;

    if (newFirstMessage === currentChat?.firstMessage) return;

    await userProvider.updateChat(currentChat!.id, {
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
