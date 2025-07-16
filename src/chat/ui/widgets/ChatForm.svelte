<script lang="ts">
  import { untrack } from "svelte";
  import { userProvider } from "../../../user/user.svelte";
  import ThemeSelection from "../features/ThemeSelection.svelte";
  import AvatarInput from "../../../shared/ui/components/AvatarInput.svelte";
  import ChatCreate from "../features/ChatCreate.svelte";
  import { pb } from "../../../shared/lib/pb";
  import { debouncedUpdateChat } from "../../features/update-chat";

  const currentChat = $derived(userProvider.chat);
  const allChats = $derived(userProvider.project?.expand?.chats || []);

  let chatName = $derived(currentChat?.name ?? "");
  let domain = $derived(currentChat?.domain ?? "");
  let firstMessage = $derived(currentChat?.firstMessage ?? "");
  let chatPicture: File | null = $state(null);
  let selectedChatId = $state("");

  async function updateChat() {
    if (!currentChat) return;

    try {
      const formData = new FormData();
      let hasChanges = false;

      if (chatName !== currentChat.name) {
        formData.append("name", chatName);
        hasChanges = true;
      }
      if (domain !== currentChat.domain) {
        formData.append("domain", domain);
        hasChanges = true;
      }
      if (firstMessage !== currentChat.firstMessage) {
        formData.append("firstMessage", firstMessage);
        hasChanges = true;
      }
      if (chatPicture) {
        formData.append("avatar", chatPicture);
        hasChanges = true;
      }

      if (hasChanges) {
        await debouncedUpdateChat(currentChat.id, formData);
        chatPicture = null;
      }
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  }

  function handleAvatarChange(file: File) {
    chatPicture = file;
    updateChat();
  }

  $effect(() => {
    if (
      chatName !== currentChat?.name ||
      domain !== currentChat?.domain ||
      firstMessage !== currentChat?.firstMessage
    ) {
      untrack(updateChat);
    }
  });

  async function handleSelectChat(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || !userProvider.integration) return;
    await userProvider.updateIntegration(userProvider.integration.id, {
      chat: id,
    });
  }
</script>

{#if !currentChat}
  <div class="flex flex-col items-center justify-center gap-6 py-16">
    <div class="w-full max-w-xl flex flex-col gap-4">
      <ChatCreate size="lg" />
      {#if allChats.length > 0}
        <select
          class="select select-bordered w-full"
          bind:value={selectedChatId}
          onchange={handleSelectChat}
        >
          <option value="">Select from project…</option>
          {#each allChats as chat}
            <option value={chat.id}>{chat.name || chat.id}</option>
          {/each}
        </select>
      {/if}
    </div>
  </div>
{:else}
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex gap-6">
        <!-- Avatar Section -->
        <AvatarInput
          avatar={currentChat?.avatar
            ? pb.files.getURL(currentChat, currentChat.avatar)
            : null}
          size="md"
          onChange={handleAvatarChange}
        />

        <!-- Form Fields -->
        <div class="flex-1 space-y-4">
          <!-- Name -->
          <div class="form-control w-full">
            <label for="chatName" class="label">
              <span class="label-text font-medium"
                >Title <span class="text-error">*</span></span
              >
            </label>
            <input
              id="chatName"
              type="text"
              bind:value={chatName}
              required
              class="input input-bordered w-full"
              placeholder="Chat name"
            />
          </div>

          <!-- Domain -->
          <div class="form-control w-full">
            <label for="chatDomain" class="label">
              <span class="label-text font-medium">Domain</span>
            </label>
            <button class="btn btn-outline w-full">Connect</button>
          </div>

          <!-- First Message -->
          <div class="form-control w-full">
            <label for="firstMessage" class="label">
              <span class="label-text font-medium">First Message</span>
            </label>
            <textarea
              id="firstMessage"
              bind:value={firstMessage}
              class="textarea textarea-bordered w-full resize-none"
              rows="4"
              placeholder="Hello! I am your AI assistant! Do you have any questions?"
            ></textarea>
          </div>
        </div>
      </div>

      <ThemeSelection />
    </div>
  </div>
{/if}
