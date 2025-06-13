<script lang="ts">
  import { onMount } from "svelte";
  import { authProvider } from "./auth/auth.svelte";

  onMount(() => {
    authProvider.subscribeUser();

    return () => {
      authProvider.unsubscribeUser();
    };
  });
</script>
