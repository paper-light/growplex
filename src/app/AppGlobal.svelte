<script lang="ts">
  import { onMount } from "svelte";

  import { authProvider } from "./auth/auth.svelte";
  import { settingsProvider } from "./settings/settings.svelte";

  onMount(() => {
    authProvider.subscribeUser();
    settingsProvider.init();

    return () => {
      authProvider.unsubscribeUser();
    };
  });
</script>
