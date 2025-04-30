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

<h1>APP ROOT</h1>

{JSON.stringify(user)}
