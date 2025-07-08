<script lang="ts">
  import { settingsProvider } from "../settings/settings.svelte";

  // derive our stores
  const currentIntegration = $derived(settingsProvider.currentIntegration);
  const agent = $derived(currentIntegration?.expand?.agent);
  const chat = $derived(currentIntegration?.expand?.chat);

  const instruction = $derived.by(() => {
    return `<script
  src="https://growplex.dev/scripts/chat-widget.js"
  data-chat-id="${chat?.id}"
><\/script>

<script
  data-domain="https://growplex.dev"
  data-id="${chat?.id}"
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

  // local UI state
  let showModal = $state(false);

  function openModal() {
    showModal = true;
  }
  function closeModal() {
    showModal = false;
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(instruction);
      // you could trigger a small toast here
    } catch {
      console.error("Failed to copy");
    }
  }
</script>

{#if agent && chat}
  <button
    onclick={openModal}
    class="
    absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-2 border-primary rounded-xl bg-primary
    hover:cursor-pointer hover:bg-black/0 transition text-3xl font-bold hover:text-primary
    px-6 py-4
    "
  >
    Connect
  </button>

  {#if showModal}
    <!-- modal toggle & box -->
    <input type="checkbox" class="modal-toggle" bind:checked={showModal} />
    <div class="modal">
      <div class="modal-box max-w-2xl relative">
        <button
          class="btn btn-sm btn-circle absolute right-2 top-2"
          onclick={closeModal}
        >
          ✕
        </button>
        <h3 class="font-bold text-lg mb-4">
          Embed on {chat.domain}
        </h3>

        <!-- nicer code block with Copy -->
        <div
          class="relative bg-base-200 border border-base-300 rounded-lg p-4 overflow-auto"
        >
          <button
            class="btn btn-ghost btn-xs absolute top-2 right-2"
            onclick={copySnippet}
          >
            Copy
          </button>
          <pre class="whitespace-pre-wrap break-all text-sm">
<code>
{instruction}
</code>
            </pre>
        </div>
      </div>
    </div>
  {/if}
{/if}
