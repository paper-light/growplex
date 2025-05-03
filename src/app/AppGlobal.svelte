<script lang="ts">
  import { onMount } from "svelte";
  import { authProvider } from "./auth/auth.svelte";

  const user = $derived(authProvider.user);

  onMount(() => {
    authProvider.subscribeUser();

    return () => {
      authProvider.unsubscribeUser();
    };
  });
</script>
