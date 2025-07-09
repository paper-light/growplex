<script lang="ts">
  import { authProvider } from "../auth/auth.svelte";
  import { pb } from "../../shared/lib/pb";
  import type { ChatsResponse } from "../../shared/models/pocketbase-types";

  interface Props {
    entity: ChatsResponse;
    onClose: () => void;
  }
  let { entity, onClose }: Props = $props();

  let chatName = $state(entity?.name ?? "");
  let domain = $state(entity?.domain ?? "");
  let theme = $state(
    JSON.stringify(entity?.theme ?? { light: {}, dark: {} }, null, 2)
  );
  let firstMessage = $state(entity?.firstMessage ?? "");
  let avatar: File | null = null;

  async function submitEditChat(e: Event) {
    e.preventDefault();
    if (!chatName || !domain || !entity) return;

    const formData = new FormData();
    formData.append("name", chatName);
    formData.append("domain", domain);
    formData.append("theme", theme);
    formData.append("firstMessage", firstMessage);
    if (avatar) formData.append("avatar", avatar);

    try {
      await pb.collection("chats").update(entity.id, formData);

      await authProvider.refreshUser();
      onClose();
    } catch (err) {
      console.error("Error updating chat:", err);
    }
  }
</script>

<h3 class="font-bold text-lg mb-4">Edit Chat</h3>

<form onsubmit={submitEditChat} class="space-y-4">
  <div class="form-control w-full">
    <label for="chatName" class="label">
      <span class="label-text">Name <span class="text-error">*</span></span>
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

  <div class="form-control w-full">
    <label for="domain" class="label">
      <span class="label-text">Domain <span class="text-error">*</span></span>
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

  <div class="form-control w-full">
    <label for="theme" class="label">
      <span class="label-text">Theme (JSON)</span>
    </label>
    <textarea
      id="theme"
      bind:value={theme}
      class="textarea textarea-bordered w-full"
      rows="5"
    ></textarea>
  </div>

  <div class="form-control w-full">
    <label for="avatar" class="label">
      <span class="label-text">Avatar</span>
    </label>
    <input
      id="avatar"
      type="file"
      accept="image/*"
      class="file-input file-input-bordered w-full"
      onchange={(e) => {
        const input = e.target as HTMLInputElement | null;
        if (input && input.files && input.files.length > 0) {
          avatar = input.files[0];
        }
      }}
    />
  </div>

  <div class="form-control w-full">
    <label for="firstMessage" class="label">
      <span class="label-text">First Message</span>
    </label>
    <textarea
      id="firstMessage"
      bind:value={firstMessage}
      class="textarea textarea-bordered w-full"
      rows="4"
    ></textarea>
  </div>

  <button type="submit" class="btn btn-primary btn-block mt-2">
    Save Changes
  </button>
</form>
