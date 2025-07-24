<script lang="ts">
  import { X } from "@lucide/svelte";
  import type { ClassValue } from "svelte/elements";

  import Select from "../../../shared/ui/lib/Select.svelte";
  import Button from "../../../shared/ui/lib/Button.svelte";
  import { integrationsProvider } from "../../../integration/providers/integrations.svelte";

  import { chatsProvider } from "../../providers/chats.svelte";
  import { chatCrud } from "../../repositories/chat-crud";
  import { settingsProvider } from "../../../user/settings.svelte";

  interface Props {
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }
  let { class: className = "", size = "md" }: Props = $props();

  const integartion = $derived(integrationsProvider.selectedIntegration);
  const selectedChat = $derived(chatsProvider.selectedIntegrationChat);
  const allChats = $derived(
    chatsProvider.chats?.filter(
      (c) => !c.integration || c.integration === selectedChat?.integration
    ) || []
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

    await chatCrud.update({
      id,
      integration: integartion.id,
    });

    settingsProvider.selectIntegrationChat(id);
  }

  async function onclick() {
    if (!selectedChat) return;

    await chatCrud.update({
      id: selectedChat.id,
      integration: "",
    });
  }
</script>

{#if options.length > 0}
  <div class={[className, "flex gap-2 items-center"]}>
    <Select value={chatId} {onchange} {options} color="neutral" {size} />

    {#if selectedChat}
      <Button color="neutral" style="outline" square {onclick}><X /></Button>
    {/if}
  </div>
{/if}
