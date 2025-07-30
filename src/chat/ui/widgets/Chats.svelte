<script lang="ts">
  import Thalia from "@/shared/assets/thalia.jpg";
  import Input from "@/shared/ui/lib/Input.svelte";
  import Select from "@/shared/ui/lib/Select.svelte";
  import { chatsProvider } from "@/chat/providers/chats.svelte";
  import { integrationsProvider } from "@/integration/providers/integrations.svelte";
  import Card from "@/shared/ui/lib/Card.svelte";
  import Modal from "@/shared/ui/lib/Modal.svelte";
  import TextArea from "@/shared/ui/lib/TextArea.svelte";
  import { chatCrud } from "@/chat/repositories/chat-crud";
  import { pb } from "@/shared/lib/pb";
  import Button from "@/shared/ui/lib/Button.svelte";
  import { projectsProvider } from "@/control/providers/projects.svelte";
  import ChatCreate from "@/chat/ui/features/crud/ChatCreate.svelte";
  import ChatAvatarUpdate from "@/chat/ui/features/crud/ChatAvatarUpdate.svelte";

  let filterIntegrationId = $state("");
  let filterName = $state("");
  let editChatId = $state("");
  let deleteChatId = $state("");

  const deleteChatOpen = $derived(deleteChatId !== "");
  const editChatOpen = $derived(editChatId !== "");

  const project = $derived(projectsProvider.selectedProject);
  const integrations = $derived(integrationsProvider.integrations);
  const filterIntegration = $derived(
    filterIntegrationId
      ? integrations.find((i) => i.id === filterIntegrationId)
      : null
  );
  const chats = $derived(chatsProvider.chats);
  const filteredChats = $derived.by(() => {
    let result = chats;
    if (filterIntegration) {
      result = result.filter((c) => c.integration === filterIntegration.id);
    }
    if (filterName) {
      result = result.filter(
        (c) => c.name?.includes(filterName) || c.id.includes(filterName)
      );
    }
    return result;
  });

  const editChat = $derived(
    editChatId ? chats.find((c) => c.id === editChatId) : null
  );

  function editChatEnd() {
    editChatId = "";
  }
</script>

<div class="px-4 py-2 space-y-4">
  <div>
    <h2 class="font-semibold">Filters</h2>

    <div class="flex gap-2 items-center flex-wrap">
      <Input
        color="neutral"
        bind:value={filterName}
        placeholder="Search Chats"
      />
      <Select
        class="w-fit max-w-64"
        bind:value={filterIntegrationId}
        color="neutral"
        options={integrations.map((i) => ({ label: i.name, value: i.id }))}
      >
        All integrations
      </Select>

      {#if filterName || filterIntegrationId}
        <Button
          onclick={() => {
            filterName = "";
            filterIntegrationId = "";
          }}
          color="neutral"
          style="outline">Clear</Button
        >
      {/if}

      <ChatCreate
        projectId={project?.id || ""}
        afterCreate={(chat) => {
          editChatId = chat.id;
        }}
      />
    </div>
  </div>

  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    {#each filteredChats as chat}
      <button class="h-full" onclick={() => (editChatId = chat.id)}>
        <Card
          class="h-full p-3 hover:bg-base-300 transition cursor-pointer flex flex-col"
          image={{
            styles: "size-36 rounded-3xl",
            src: pb.files.getURL(chat, chat.avatar) || Thalia.src,
            alt: chat.name || chat.id,
            mode: "side",
          }}
          title={chat.name || `Chat ${chat.id.slice(0, 8)}`}
        >
          <div class="flex-1 space-y-2">
            <p class="text-sm text-base-content/50 overflow-hidden">
              <span
                class="block overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {chat.firstMessage || "No first message set"}
              </span>
            </p>
            {#if chat.domain}
              <p class="text-xs text-base-content/30">
                {chat.domain}
              </p>
            {/if}
            {#if chat.integration}
              <p class="text-xs text-primary">Connected to integration</p>
            {/if}
          </div>
        </Card>
      </button>
    {/each}
  </div>
</div>

<Modal onclose={editChatEnd} open={editChatOpen}>
  <form
    onsubmit={async (e) => {
      if (!editChat) return;
      e.preventDefault();

      const inputAvatar = (e.currentTarget as any).avatar.files?.[0] || null;
      const inputName = (e.currentTarget as any).name.value;
      const inputDomain = (e.currentTarget as any).domain.value;
      const inputFirstMessage = (e.currentTarget as any).firstMessage.value;

      await chatCrud.update({
        id: editChat.id,
        name: inputName,
        domain: inputDomain,
        firstMessage: inputFirstMessage,
        avatar: inputAvatar,
      });

      editChatEnd();
    }}
  >
    <div class="flex gap-4">
      <ChatAvatarUpdate
        chat={editChat || null}
        mode="form"
        afterUpdate={() => {
          editChatEnd();
        }}
      />

      <div class="flex-1 space-y-4">
        <Input
          color="neutral"
          name="name"
          value={editChat?.name || ""}
          placeholder="Chat Name"
        >
          Name
        </Input>

        <Input
          color="neutral"
          name="domain"
          value={editChat?.domain || ""}
          placeholder="https://example.com"
        >
          Domain
        </Input>

        <TextArea
          color="neutral"
          name="firstMessage"
          value={editChat?.firstMessage || ""}
          placeholder="Hello! I am your AI assistant! Do you have any questions?"
        >
          First Message
        </TextArea>
      </div>
    </div>

    <div class="flex justify-end gap-1 mt-4">
      <Button type="submit" color="primary" style="outline">Save</Button>

      <Button
        type="button"
        color="neutral"
        style="outline"
        onclick={editChatEnd}>Cancel</Button
      >

      <Button
        type="button"
        color="error"
        style="outline"
        onclick={() => {
          deleteChatId = editChat?.id || "";
        }}>Delete</Button
      >
    </div>
  </form>
</Modal>

<Modal onclose={() => (deleteChatId = "")} open={deleteChatOpen}>
  <div class="flex flex-col gap-4">
    <h2 class="font-semibold">Delete Chat</h2>
    <p>
      Are you sure you want to delete this chat? This action cannot be undone.
    </p>

    <div class="flex gap-2">
      <Button
        color="neutral"
        style="outline"
        onclick={() => (deleteChatId = "")}
      >
        Cancel
      </Button>
      <Button
        color="error"
        style="outline"
        onclick={() => {
          if (!deleteChatId) return;
          chatCrud.delete(deleteChatId);
          deleteChatId = "";
          editChatEnd();
        }}>Delete</Button
      >
    </div>
  </div>
</Modal>
