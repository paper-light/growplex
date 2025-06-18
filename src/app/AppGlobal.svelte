<script lang="ts">
  import { onMount } from "svelte";
  import { authProvider } from "./auth/auth.svelte";
  import { settingsProvider } from "./settings/settings.svelte";

  onMount(() => {
    authProvider.subscribeUser();

    return () => {
      authProvider.unsubscribeUser();
    };
  });
</script>
