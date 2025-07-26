<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import type { ChatsResponse } from "../../../../shared/models/pocketbase-types";
  import { themes } from "../../../../shared/styles/themes";
  import Button from "../../../../shared/ui/lib/Button.svelte";
  import { chatCrud } from "../../../repositories/chat-crud";

  interface Props {
    chat: ChatsResponse;
    class?: ClassValue;
  }

  let { chat, class: className = "" }: Props = $props();

  const theme = $derived(chat.theme as any);
  const previewTheme = $derived(theme?.preview || "light");
  const productionTheme = $derived(theme?.production || "light");

  function savePreviewTheme(themeName: string) {
    if (!chat) return;

    chatCrud.update({ id: chat.id, theme: { ...theme, preview: themeName } });
  }

  function saveProductionTheme(themeName: string) {
    if (!chat) return;

    chatCrud.update({
      id: chat.id,
      theme: { ...theme, production: themeName },
    });
  }
</script>

<div class={className}>
  <label class="label">
    <span class="label-text font-medium">Theme Selection</span>
  </label>
  <ul class="max-h-64 overflow-y-auto space-y-2 px-4 rounded-lg border-2">
    {#each themes as theme}
      <li
        class={[
          "cursor-pointer rounded-lg transition-all hover:scale-105 border-2",
          productionTheme === theme
            ? "border-primary bg-primary/10"
            : previewTheme === theme
              ? "border-info bg-info/10"
              : "border-base-300",
        ]}
        onclick={() => savePreviewTheme(theme)}
      >
        <div data-theme={theme} class="flex items-center gap-3">
          <div class="flex gap-1 p-3">
            <div class="size-4 rounded-full bg-primary"></div>
            <div class="size-4 rounded-full bg-secondary"></div>
            <div class="size-4 rounded-full bg-neutral"></div>
            <div class="size-4 rounded-full bg-accent"></div>
          </div>
          <span
            class={[
              "text-sm font-medium capitalize bg-base-100",
              previewTheme === theme && "text-primary",
            ]}
          >
            {theme}
          </span>
        </div>
      </li>
    {/each}
  </ul>

  <div class="flex gap-2 mt-4">
    <Button
      style="soft"
      class="grow"
      color="primary"
      onclick={() => saveProductionTheme(previewTheme)}
    >
      Save for web-site connection
    </Button>
    <Button size="sm" class="grow hidden" color="neutral">Edit</Button>
  </div>
</div>
