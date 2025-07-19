<script lang="ts">
  import { userProvider } from "../../../user/user.svelte";
  import { debounce } from "../../../shared/helpers/debounce";

  const DEBOUNCE_TIME = 1.2 * 1000;

  const currentChat = $derived(userProvider.chat);

  let firstMessage = $derived(currentChat?.firstMessage ?? "");

  const updateFirstMessage = debounce(async (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    const newFirstMessage = target.value;

    if (newFirstMessage === currentChat?.firstMessage) return;

    await userProvider.updateChat(currentChat!.id, {
      firstMessage: newFirstMessage,
    });
  }, DEBOUNCE_TIME);
</script>

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
    oninput={updateFirstMessage}
  ></textarea>
</div>
