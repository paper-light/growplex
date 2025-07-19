<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { uiProvider } from "../../../user/ui.svelte";
  import { themes } from "../../../shared/styles/themes";
  import Button from "../../../shared/ui/lib/Button.svelte";

  interface Props {
    class?: ClassValue;
  }

  let { class: className = "" }: Props = $props();

  let initialChatTheme = $derived(uiProvider.initialChatTheme);

  let selectedTheme = $derived(uiProvider.selectedChatTheme);

  function selectTheme(themeName: string) {
    uiProvider.setSelectedChatTheme(themeName);
  }

  function saveTheme() {
    uiProvider.setInitialChatTheme(selectedTheme);
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
          initialChatTheme === theme
            ? "border-primary bg-primary/10"
            : selectedTheme === theme
              ? "border-info bg-info/10"
              : "border-base-300",
        ]}
        onclick={() => selectTheme(theme)}
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
              selectedTheme === theme && "text-primary",
            ]}
          >
            {theme}
          </span>
        </div>
      </li>
    {/each}
  </ul>

  <div class="flex gap-2 mt-4">
    <Button style="soft" class="grow" color="primary" onclick={saveTheme}>
      Save for web-site connection
    </Button>
    <Button size="sm" class="grow hidden" color="neutral">Edit</Button>
  </div>
</div>
