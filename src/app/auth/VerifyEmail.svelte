<script lang="ts">
  import { authProvider } from "./auth.svelte";

  const user = authProvider.user;
</script>

<h1>VERIFY EMAIL</h1>

<p>USER</p>
{JSON.stringify(user)}
<br />
{authProvider.pb.authStore.isValid}
