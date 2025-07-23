<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Select from "../../../shared/ui/lib/Select.svelte";
  import { integrationsProvider } from "../../../integration/providers/integrations.svelte";

  import { chatsProvider } from "../../providers/chats.svelte";
  import { chatCrud } from "../../repositories/chat-crud";
  interface Props {
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }
  let { class: className = "", size = "md" }: Props = $props();

  const integartion = $derived(integrationsProvider.selectedIntegration);
  const allChats = $derived(chatsProvider.chats || []);
  const selectedChat = $derived(chatsProvider.selectedIntegrationChat);

  let value = $derived(selectedChat?.id || "");

  const options = $derived.by(() => {
    return allChats.map((chat) => ({
      value: chat.id,
      label: chat.name || chat.id,
    }));
  });

  async function onchange(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || !integartion || !selectedChat) return;
    await chatCrud.update({
      id: selectedChat.id,
      integration: integartion.id,
    });
  }
</script>

<div class={className}>
  <Select {value} {onchange} {options} color="neutral" {size} />
</div>
