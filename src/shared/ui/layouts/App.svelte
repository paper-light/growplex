<script lang="ts">
  import "../../../auth/pb/pbOnChange";

  import { onMount } from "svelte";

  import { authProvider } from "../../../user/auth.svelte";
  import { socketProvider } from "../../../chat/provider/socket.svelte";
  import { pb } from "../../lib/pb";

  onMount(() => {
    authProvider.subscribeUser();
    socketProvider.connect(authProvider.token || pb.authStore.token);

    return () => {
      authProvider.unsubscribeUser();
      socketProvider.disconnect();
    };
  });
</script>
