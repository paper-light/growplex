<script lang="ts">
  import { authProvider } from "../auth/auth.svelte";
  import { pb } from "../../shared/lib/pb";
  import { settingsProvider } from "../settings/settings.svelte";

  interface Props {
    onClose: () => void;
  }
  let { onClose }: Props = $props();

  const currentProject = $derived(settingsProvider.currentProject);
  const currentIntegration = $derived(settingsProvider.currentIntegration);

  // Default values:
  let defaultTheme = `{
  "light": {},
  "dark": {}
}`;
  let defaultFirstMessage = `Hello! I am your AI assistant! Do you have any questions?`;

  async function submitCreateChat(e: Event) {
    e.preventDefault();
    if (!currentProject || !currentIntegration) return;

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const domain = (formData.get("domain") as string)?.trim();
    if (!domain) {
      return;
    }

    try {
      const newChat = await pb.collection("chats").create(formData);

      await Promise.all([
        pb.collection("projects").update(currentProject.id, {
          "chats+": [newChat.id],
        }),
        pb.collection("integrations").update(currentIntegration.id, {
          chat: newChat.id,
        }),
      ]);

      await authProvider.refreshUser();
      onClose();
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  }
</script>

<h3 class="font-bold text-lg mb-4">Create Chat</h3>

<form onsubmit={submitCreateChat} class="space-y-4">
  <div class="form-control w-full">
    <label for="chatName" class="label">
      <span class="label-text">Name <span class="text-error">*</span></span>
    </label>
    <input
      id="chatName"
      name="name"
      type="text"
      required
      class="input input-bordered w-full"
      placeholder="Chat name"
    />
  </div>

  <!-- Domain (required) -->
  <div class="form-control w-full">
    <label for="domain" class="label">
      <span class="label-text">Domain <span class="text-error">*</span></span>
    </label>
    <input
      id="domain"
      name="domain"
      type="text"
      required
      class="input input-bordered w-full"
      placeholder="https://example.com"
    />
  </div>

  <!-- Theme JSON -->
  <div class="form-control w-full">
    <label for="theme" class="label">
      <span class="label-text">Theme (JSON)</span>
    </label>
    <textarea
      id="theme"
      name="theme"
      class="textarea textarea-bordered w-full"
      rows="5">{defaultTheme}</textarea
    >
  </div>

  <!-- Avatar file upload -->
  <div class="form-control w-full">
    <label for="avatar" class="label">
      <span class="label-text">Avatar</span>
    </label>
    <input
      id="avatar"
      name="avatar"
      type="file"
      accept="image/*"
      class="file-input file-input-bordered w-full"
    />
  </div>

  <!-- First message -->
  <div class="form-control w-full">
    <label for="firstMessage" class="label">
      <span class="label-text">First Message</span>
    </label>
    <textarea
      id="firstMessage"
      name="firstMessage"
      class="textarea textarea-bordered w-full"
      rows="4">{defaultFirstMessage}</textarea
    >
  </div>

  <button type="submit" class="btn btn-primary btn-block mt-2">
    Create Chat
  </button>
</form>
