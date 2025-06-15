<script lang="ts">
  import { authProvider } from "./auth.svelte";

  const user = $derived(authProvider.user);

  let i = $state("");
</script>

<h1>VERIFY EMAIL</h1>

<p>USER</p>
{JSON.stringify(user)}

<button
  class="btn"
  onclick={(e) => {
    console.log(authProvider.pb.authStore);
    authProvider.logout();
    console.log(authProvider.pb.authStore);
  }}>Logout</button
>

<input bind:value={i} type="text" />
<button
  class="btn"
  onclick={(e) => {
    if (!user) return;
    authProvider.pb.collection("users").update(user.id, { name: i });
  }}>NAME</button
>
