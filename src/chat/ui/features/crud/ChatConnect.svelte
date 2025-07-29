<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Copy, Rocket, X, Check } from "@lucide/svelte";

  import Button from "../../../../shared/ui/lib/Button.svelte";
  import { chatsProvider } from "../../../providers/chats.svelte";
  import Modal from "../../../../shared/ui/lib/Modal.svelte";

  interface Props {
    class?: ClassValue;
  }

  let { class: className = "" }: Props = $props();

  let copied = $state(false);

  const currentChat = $derived(chatsProvider.selectedIntegrationChat);
  const domain = $derived(currentChat?.domain);
  const theme = $derived((currentChat?.theme as any)?.production);
  const chatId = $derived(currentChat?.id);

  const instruction = $derived.by(() => {
    return `
<script src="https://growplex.dev/scripts/chat-widget.js"><\/script>

<script>
  (function () {
    if (!window.ChatWidget) return;

    const theme = document.documentElement.getAttribute("data-theme");
    const open = localStorage.getItem("chat-widget-open") === "true";

    if (!window.ChatWidget) return;
    window.ChatWidget.init({
      chatId: ${chatId},
      domain: "https://growplex.dev",
      listenTheme: false, // if true, will listen html data-theme attribute
      // initTheme: theme || ${theme} || "light", // you can set any default theme here
      initOpen: open,
    });
  })();
<\/script>`.trim();
  });

  async function onclose() {
    showModal = false;
    copied = false;
  }

  let showModal = $state(false);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(instruction);
      copied = true;
    } catch {
      console.error("Failed to copy");
    }
  }
</script>

<div class={className}>
  <Button
    disabled={!domain}
    size="xl"
    color="primary"
    block
    onclick={() => (showModal = true)}
  >
    Connect <Rocket class="size-4" />
  </Button>
  {#if !domain}
    <p class="text-sm text-error">
      You need to set domain, where your agent will be hosted.
    </p>
  {/if}
</div>

<Modal bind:open={showModal}>
  <div class="flex flex-col gap-4 mb-6">
    <h3 class="text-lg font-bold">Add this script to your site's head tag</h3>

    <pre class="whitespace-pre-wrap break-all text-sm mockup-code">
<code>
{instruction}
</code>
      </pre>
  </div>

  <div class="flex justify-end gap-2">
    <Button color="primary" onclick={copySnippet}>
      {#if copied}
        Copied <Check />
      {:else}
        Copy <Copy />
      {/if}
    </Button>
    <Button color="neutral" style="outline" onclick={onclose}
      >Close <X />
    </Button>
  </div>
</Modal>
