<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { Plus } from "@lucide/svelte";

  import Button from "@/shared/ui/Button.svelte";
  import { pb } from "@/shared/lib/pb";
  import type { SourcesResponse } from "@/shared/models/pocketbase-types";

  interface Props {
    projectId: string;
    metadata?: Record<string, any>;
    class?: ClassValue;
    style?: "soft" | "outline" | "ghost" | "solid";
    color?: "primary" | "secondary" | "accent" | "neutral" | "error";
    name?: string;
    children?: Snippet;
    onSuccess?: (source: SourcesResponse) => void;
    onError?: (error: Error) => void;
  }

  const {
    projectId,
    metadata,
    class: className,
    style = "soft",
    color = "primary",
    name,
    onSuccess,
    onError,
    children,
  }: Props = $props();

  const createSource = async () => {
    try {
      const source = await pb.collection("sources").create({
        name,
        project: projectId,
        metadata,
      });

      onSuccess?.(source);
    } catch (error) {
      onError?.(error as Error);
    }
  };
</script>

<Button
  {style}
  {color}
  onclick={createSource}
  class={["flex items-center gap-2", className]}
>
  {#if children}
    {@render children()}
  {:else}
    <Plus class="size-4" />
    Create Source
  {/if}
</Button>
