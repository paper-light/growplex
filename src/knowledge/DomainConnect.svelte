<script lang="ts">
  import { sourcesProvider } from "./providers/sources.svelte";

  const source = $derived(sourcesProvider.source);

  let { size = "md" }: { size?: "sm" | "md" | "lg" } = $props();
</script>

<button class="btn btn-primary w-full text-2xl">
  {source?.name || "Connect Domain"}
</button>
