<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { settingsProvider } from "../../user/settings.svelte";
  import { authProvider } from "../../user/auth.svelte";
  import { pb } from "../../shared/lib/pb";
  import ThemeSelection from "./ThemeSelection.svelte";
  import AvatarInput from "../../shared/ui/components/AvatarInput.svelte";
  import ChatCreate from "./ChatCreate.svelte";

  const currentChat = $derived(settingsProvider.currentChat);
  const allChats = $derived(
    settingsProvider.currentProject?.expand?.chats || []
  );

  let chatName = $derived(currentChat?.name ?? "");
  let domain = $derived(currentChat?.domain ?? "");
  let firstMessage = $derived(currentChat?.firstMessage ?? "");
  let chatPicture: File | null = $state(null);
  let chatUpdateTimer: NodeJS.Timeout | null = $state(null);
  let selectedChatId = $state("");

  function debouncedChatUpdate() {
    if (chatUpdateTimer) {
      clearTimeout(chatUpdateTimer);
    }
    chatUpdateTimer = setTimeout(async () => {
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
          await pb.collection("chats").update(currentChat.id, formData);
          await authProvider.refreshUser();
          chatPicture = null; // Reset after upload
        }
      } catch (error) {
        console.error("Error updating chat:", error);
      }
    }, 500);
  }

  function handleAvatarChange(file: File) {
    chatPicture = file;
    debouncedChatUpdate();
  }

  $effect(() => {
    if (
      chatName !== currentChat?.name ||
      domain !== currentChat?.domain ||
      firstMessage !== currentChat?.firstMessage
    ) {
      untrack(debouncedChatUpdate);
    }
  });

  onMount(() => {
    return () => {
      if (chatUpdateTimer) clearTimeout(chatUpdateTimer);
    };
  });

  async function handleSelectChat(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || !settingsProvider.currentIntegration) return;
    await pb
      .collection("integrations")
      .update(settingsProvider.currentIntegration.id, { chat: id });
    await authProvider.refreshUser();
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
