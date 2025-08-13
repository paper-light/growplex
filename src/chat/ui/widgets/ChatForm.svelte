<script lang="ts">
  import type { RecordModel } from "pocketbase";

  import Card from "@/shared/ui/Card.svelte";
  import { projectsProvider } from "@/project/providers/projects.svelte";

  import { chatsProvider } from "@/chat/providers/chats.svelte";
  import ChatSelect from "@/chat/ui/features/crud/ChatSelect.svelte";
  import ChatAvatarUpdate from "@/chat/ui/features/crud/ChatAvatarUpdate.svelte";
  import ThemeSelection from "@/chat/ui/features/crud/ThemeSelection.svelte";
  import EditStringField from "@/shared/ui/features/EditStringField.svelte";
  import EditTextField from "@/shared/ui/features/EditTextField.svelte";

  import ChatConnect from "../features/crud/ChatConnect.svelte";

  const project = $derived(projectsProvider.selectedProject);
  const chat = $derived(chatsProvider.selectedIntegrationChat);
</script>

<Card title="Chat" class="space-y-4 max-w-2xl mx-auto">
  <div class="mb-4 space-y-2">
    <ChatConnect />
    <EditStringField
      record={chat as RecordModel}
      class="font-semibold"
      key="domain"
      size="lg"
      placeholder="Your domain"
    />
  </div>

  <div class="divider"></div>

  <div class="space-y-4">
    <ChatSelect />

    {#if chat}
      <div class="flex gap-6">
        <ChatAvatarUpdate {chat} class="flex-1 max-w-24" mode="action" />

        <div class="flex-1 space-y-2">
          <EditStringField
            record={chat as RecordModel}
            class="font-semibold"
            ghost
            size="lg"
            key="name"
          />
        </div>
      </div>

      <EditTextField record={chat as RecordModel} key="firstMessage">
        Hello! I am your AI assistant! Do you have any questions?
      </EditTextField>

      <ThemeSelection {chat} />
    {/if}
  </div>
</Card>
