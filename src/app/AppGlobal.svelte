<script lang="ts">
  import { onMount } from "svelte";

  import { authProvider } from "./auth/auth.svelte";
  import { settingsProvider } from "./settings/settings.svelte";
  import { uiProvider } from "./settings/ui.svelte";
  import { socketProvider } from "./chat/socket.svelte";

  onMount(() => {
    uiProvider.init();

    settingsProvider.init(authProvider.user);

    authProvider.subscribeUser();

    socketProvider.init();

    return () => {
      authProvider.unsubscribeUser();

      socketProvider.disconnect();
    };
  });
</script>
