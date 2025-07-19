<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { LoaderCircle } from "@lucide/svelte";

  import { sourcesProvider } from "../providers/sources.svelte";

  interface Props {
    sourceId: string;
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }

  let { sourceId, class: className = "", size = "md" }: Props = $props();

  const sources = $derived(sourcesProvider.sources);
  const source = $derived(sources.find((s) => s.id === sourceId));
</script>

<div class={className}>
  <LoaderCircle class="size-4 animate-spin" />
  {source?.name || sourceId}
</div>
