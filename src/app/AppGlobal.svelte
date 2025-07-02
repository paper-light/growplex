<script lang="ts">
  import { onMount } from "svelte";

  import { authProvider } from "./auth/auth.svelte";
  import { settingsProvider } from "./settings/settings.svelte";
  import { uiProvider } from "./settings/ui.svelte";

  onMount(() => {
    uiProvider.init();

    settingsProvider.init(authProvider.user);

    authProvider.subscribeUser();

    return () => {
      authProvider.unsubscribeUser();
    };
  });
</script>
