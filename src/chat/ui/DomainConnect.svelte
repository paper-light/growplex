<script lang="ts">
  import { settingsProvider } from "../../user/settings.svelte";
  import { authProvider } from "../../user/auth.svelte";

  let { size = "md" }: { size?: "sm" | "md" | "lg" } = $props();
</script>

<button class="btn btn-primary w-full text-2xl">Connect Domain</button>
