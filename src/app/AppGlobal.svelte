<script lang="ts">
  import "./auth/pbOnChange";

  import { onMount } from "svelte";

  import { authProvider } from "./auth/auth.svelte";
  import { socketProvider } from "./chat/socket.svelte";

  onMount(() => {
    authProvider.subscribeUser();
    socketProvider.connect();

    return () => {
      authProvider.unsubscribeUser();
      socketProvider.disconnect();
    };
  });
</script>
