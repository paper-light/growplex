<script lang="ts">
  import "../../../app/auth/pbOnChange";

  import { onMount } from "svelte";

  import { authProvider } from "../../../app/auth/auth.svelte";
  import { socketProvider } from "../../../app/chat/socket.svelte";

  onMount(() => {
    authProvider.subscribeUser();
    socketProvider.connect();

    return () => {
      authProvider.unsubscribeUser();
      socketProvider.disconnect();
    };
  });
</script>
