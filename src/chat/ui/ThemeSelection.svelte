<script lang="ts">
  import { settingsProvider } from "../../app/settings/settings.svelte";
  import { authProvider } from "../../app/auth/auth.svelte";
  import { pb } from "../../shared/lib/pb";
  import { onMount } from "svelte";

  const currentChat = $derived(settingsProvider.currentChat);

  let theme = $derived(
    JSON.stringify(currentChat?.theme ?? { light: {}, dark: {} }, null, 2)
  );
  let chatUpdateTimer: NodeJS.Timeout | null = $state(null);

  // Theme presets for the grid
  const themePresets = [
    { name: "Default", colors: { light: {}, dark: {} } },
    {
      name: "Blue",
      colors: { light: { primary: "#3B82F6" }, dark: { primary: "#60A5FA" } },
    },
    {
      name: "Green",
      colors: { light: { primary: "#10B981" }, dark: { primary: "#34D399" } },
    },
    {
      name: "Purple",
      colors: { light: { primary: "#8B5CF6" }, dark: { primary: "#A78BFA" } },
    },
    {
      name: "Orange",
      colors: { light: { primary: "#F59E0B" }, dark: { primary: "#FBBF24" } },
    },
    {
      name: "Red",
      colors: { light: { primary: "#EF4444" }, dark: { primary: "#F87171" } },
    },
    {
      name: "Pink",
      colors: { light: { primary: "#EC4899" }, dark: { primary: "#F472B6" } },
    },
    {
      name: "Indigo",
      colors: { light: { primary: "#6366F1" }, dark: { primary: "#818CF8" } },
    },
    {
      name: "Teal",
      colors: { light: { primary: "#14B8A6" }, dark: { primary: "#5EEAD4" } },
    },
    {
      name: "Yellow",
      colors: { light: { primary: "#EAB308" }, dark: { primary: "#FDE047" } },
    },
  ];

  function debouncedChatUpdate() {
    if (chatUpdateTimer) {
      clearTimeout(chatUpdateTimer);
    }
    chatUpdateTimer = setTimeout(async () => {
      if (!currentChat) return;

      try {
        const formData = new FormData();
        let hasChanges = false;

        if (theme !== JSON.stringify(currentChat.theme, null, 2)) {
          formData.append("theme", theme);
          hasChanges = true;
        }

        if (hasChanges) {
          await pb.collection("chats").update(currentChat.id, formData);
          await authProvider.refreshUser();
        }
      } catch (error) {
        console.error("Error updating chat theme:", error);
      }
    }, 500);
  }

  function selectTheme(preset: (typeof themePresets)[0]) {
    theme = JSON.stringify(preset.colors, null, 2);
    debouncedChatUpdate();
  }

  $effect(() => {
    if (theme !== JSON.stringify(currentChat?.theme, null, 2)) {
      debouncedChatUpdate();
    }
  });

  onMount(() => {
    return () => {
      if (chatUpdateTimer) clearTimeout(chatUpdateTimer);
    };
  });
</script>

<div class="mt-6">
  <label class="label">
    <span class="label-text font-medium">Theme Selection</span>
  </label>
  <div class="grid grid-cols-5 gap-2">
    {#each themePresets as preset}
      <button
        class="btn btn-outline btn-sm h-12"
        onclick={() => selectTheme(preset)}
        style="background-color: {preset.colors.light?.primary || '#6B7280'}"
      >
        {preset.name}
      </button>
    {/each}
  </div>
  <div class="grid grid-cols-5 gap-2 mt-2">
    {#each themePresets.slice(5) as preset}
      <button
        class="btn btn-outline btn-sm h-12"
        onclick={() => selectTheme(preset)}
        style="background-color: {preset.colors.light?.primary || '#6B7280'}"
      >
        {preset.name}
      </button>
    {/each}
  </div>
</div>
