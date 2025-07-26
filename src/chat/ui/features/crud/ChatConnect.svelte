<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Rocket } from "@lucide/svelte";

  import Button from "../../../../shared/ui/lib/Button.svelte";
  import { chatsProvider } from "../../../providers/chats.svelte";

  interface Props {
    class?: ClassValue;
  }

  let { class: className = "" }: Props = $props();

  const currentChat = $derived(chatsProvider.selectedChat);

  const instruction = $derived.by(() => {
    return `<script
  src="https://growplex.dev/scripts/chat-widget.js"
  data-chat-id="${currentChat?.id}"
><\/script>

<script
  data-domain="https://growplex.dev"
  data-id="${currentChat?.id}"
>
  (function () {
    const { id, domain } = document.currentScript.dataset;
    function boot() {
      if (!window.ChatWidget) return;
      if (!window.ChatWidget._loaded) {
        window.ChatWidget.init({ id, domain, color: "oklch(68.5% 0.169 237.323)" });
      } else {
        window.ChatWidget.reload({ id, domain, color: "oklch(68.5% 0.169 237.323)" });
      }
    }
    boot();
  })();
<\/script>`.trim();
  });

  async function onclick() {
    console.log("clicked");
  }

  let showModal = $state(false);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(instruction);
    } catch {
      console.error("Failed to copy");
    }
  }
</script>

<div class={className}>
  <Button
    color="primary"
    block
    style="outline"
    onclick={() => (showModal = true)}
  >
    Connect <Rocket class="size-4" />
  </Button>
</div>
