<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { CheckCircle, LoaderCircle } from "@lucide/svelte";

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

<div
  class={[
    className,
    "flex items-center gap-2 badge badge-soft badge-lg",
    source?.status === "idle" ? "badge-success" : "badge-info",
  ]}
>
  {#if source?.status === "idle"}
    <CheckCircle class="size-4" />
  {:else if source?.status === "pending"}
    <LoaderCircle class="size-4 animate-spin" />
  {/if}
  {source?.name || sourceId}
</div>
