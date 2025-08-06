<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Select from "@/shared/ui/Select.svelte";
  import { integrationsProvider } from "@/integration/providers/integrations.svelte";

  import { chatsProvider } from "@/chat/providers/chats.svelte";
  import { settingsProvider } from "@/user/settings.svelte";

  interface Props {
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }
  let { class: className = "", size = "md" }: Props = $props();

  const integartion = $derived(integrationsProvider.selectedIntegration);
  const selectedChat = $derived(chatsProvider.selectedIntegrationChat);
  const allChats = $derived(
    chatsProvider.chats?.filter((c) => c.integration === integartion?.id) || []
  );

  const chatId = $derived(selectedChat?.id || "");

  const options = $derived(
    allChats.map((chat) => ({
      value: chat.id,
      label: chat.name || chat.id,
    }))
  );

  async function onchange(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || !integartion) return;

    settingsProvider.selectIntegrationChat(id);
  }
</script>

{#if options.length > 0}
  <div class={[className, "flex gap-2 items-center"]}>
    <Select value={chatId} {onchange} {options} color="neutral" {size} />
  </div>
{/if}
