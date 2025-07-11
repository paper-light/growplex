<script lang="ts">
  import { settingsProvider } from "../app/settings/settings.svelte";
  import { authProvider } from "../app/auth/auth.svelte";
  import { pb } from "../shared/lib/pb";
  import { onMount } from "svelte";

  const currentAgent = $derived(settingsProvider.currentAgent);
  const currentChat = $derived(settingsProvider.currentChat);
  const currentSources = $derived(settingsProvider.currentSources);

  let agentName = $derived(currentAgent?.name ?? "");
  let systemInstruction = $derived(currentAgent?.system ?? "");
  let agentAvatar: File | null = $state(null);

  let chatName = $derived(currentChat?.name ?? "");
  let domain = $derived(currentChat?.domain ?? "");
  let theme = $derived(
    JSON.stringify(currentChat?.theme ?? { light: {}, dark: {} }, null, 2)
  );
  let firstMessage = $derived(currentChat?.firstMessage ?? "");
  let chatPicture: File | null = $state(null);

  let agentUpdateTimer: NodeJS.Timeout | null = $state(null);
  let chatUpdateTimer: NodeJS.Timeout | null = $state(null);

  function debouncedAgentUpdate() {
    if (agentUpdateTimer) {
      clearTimeout(agentUpdateTimer);
    }
    agentUpdateTimer = setTimeout(async () => {
      if (!currentAgent) return;

      try {
        const formData = new FormData();
        let hasChanges = false;

        if (agentName !== currentAgent.name) {
          formData.append("name", agentName);
          hasChanges = true;
        }
        if (systemInstruction !== currentAgent.system) {
          formData.append("system", systemInstruction);
          hasChanges = true;
        }
        if (agentAvatar) {
          formData.append("avatar", agentAvatar);
          hasChanges = true;
        }

        if (hasChanges) {
          await pb.collection("agents").update(currentAgent.id, formData);
          await authProvider.refreshUser();
          agentAvatar = null; // Reset after upload
        }
      } catch (error) {
        console.error("Error updating agent:", error);
      }
    }, 500);
  }

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
        if (theme !== JSON.stringify(currentChat.theme, null, 2)) {
          formData.append("theme", theme);
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

  function handleAgentAvatarChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      agentAvatar = input.files[0];
      debouncedAgentUpdate();
    }
  }

  function handleChatPictureChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      chatPicture = input.files[0];
      debouncedChatUpdate();
    }
  }

  $effect(() => {
    if (
      agentName !== currentAgent?.name ||
      systemInstruction !== currentAgent?.system
    ) {
      debouncedAgentUpdate();
    }
  });

  $effect(() => {
    if (
      chatName !== currentChat?.name ||
      domain !== currentChat?.domain ||
      theme !== JSON.stringify(currentChat?.theme, null, 2) ||
      firstMessage !== currentChat?.firstMessage
    ) {
      debouncedChatUpdate();
    }
  });

  onMount(() => {
    return () => {
      if (agentUpdateTimer) clearTimeout(agentUpdateTimer);
      if (chatUpdateTimer) clearTimeout(chatUpdateTimer);
    };
  });
</script>

<div class="h-full flex flex-col p-4">
  <div class="space-y-3 overflow-y-auto flex-1">
    <!-- Agent Section -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold mb-4">Agent</h2>

        <div class="space-y-4">
          <!-- Avatar -->
          <div class="form-control w-full">
            <label for="agentAvatar" class="label">
              <span class="label-text">Avatar</span>
            </label>
            <input
              id="agentAvatar"
              type="file"
              accept="image/*"
              class="file-input file-input-bordered w-full"
              onchange={handleAgentAvatarChange}
            />
          </div>

          <!-- Name -->
          <div class="form-control w-full">
            <label for="agentName" class="label">
              <span class="label-text"
                >Name <span class="text-error">*</span></span
              >
            </label>
            <input
              id="agentName"
              type="text"
              bind:value={agentName}
              required
              class="input input-bordered w-full"
              placeholder="Agent name"
            />
          </div>

          <!-- System Instruction -->
          <div class="form-control w-full">
            <label for="systemInstruction" class="label">
              <span class="label-text">System Instruction</span>
            </label>
            <textarea
              id="systemInstruction"
              bind:value={systemInstruction}
              rows="4"
              class="textarea textarea-bordered w-full resize-none"
              placeholder="e.g. 'You are a helpful assistant…'"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Section -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold mb-4">Chat</h2>

        <div class="form-control w-full">
          <label for="domain" class="label">
            <span class="label-text"
              >Domain <span class="text-error">*</span></span
            >
          </label>
          <input
            id="domain"
            type="text"
            bind:value={domain}
            required
            class="input input-bordered w-full"
            placeholder="https://example.com"
          />
        </div>

        <div class="space-y-4">
          <!-- Picture -->
          <div class="form-control w-full">
            <label for="chatPicture" class="label">
              <span class="label-text">Picture</span>
            </label>
            <input
              id="chatPicture"
              type="file"
              accept="image/*"
              class="file-input file-input-bordered w-full"
              onchange={handleChatPictureChange}
            />
          </div>

          <!-- First Message -->
          <div class="form-control w-full">
            <label for="firstMessage" class="label">
              <span class="label-text">First Message</span>
            </label>
            <textarea
              id="firstMessage"
              bind:value={firstMessage}
              class="textarea textarea-bordered w-full resize-none"
              rows="4"
              placeholder="Hello! I am your AI assistant! Do you have any questions?"
            ></textarea>
          </div>

          <!-- Theme -->
          <div class="form-control w-full">
            <label for="theme" class="label">
              <span class="label-text">Theme (JSON)</span>
            </label>
            <textarea
              id="theme"
              bind:value={theme}
              class="textarea textarea-bordered w-full resize-none"
              rows="5"
              placeholder={'{"light": {}, "dark": {}}'}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
