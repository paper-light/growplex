<script lang="ts">
  import type { RecordModel } from "pocketbase";
  import type { ClassValue } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { Plus } from "@lucide/svelte";

  import Button from "@/shared/ui/Button.svelte";
  import { pb } from "@/shared/lib/pb";

  interface Props {
    class?: ClassValue;
    style?: "soft" | "outline" | "ghost" | "solid";
    color?: "primary" | "secondary" | "accent" | "neutral" | "error";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    children?: Snippet;
    onSuccess?: (record: RecordModel) => void;
    onError?: (error: unknown) => void;

    projectId: string;
    collection: string;
    data?: Record<string, any>;
  }

  const {
    projectId,
    collection,
    data,
    class: className,
    style = "soft",
    color = "primary",
    onSuccess,
    onError,
    size = "md",
    children,
  }: Props = $props();

  const createRecord = async () => {
    try {
      const record = await pb.collection(collection).create({
        ...data,
        project: projectId,
      });

      onSuccess?.(record);
    } catch (error) {
      onError?.(error);
    }
  };
</script>

<div class={[className]}>
  <Button
    {style}
    {color}
    {size}
    onclick={createRecord}
    class="flex items-center gap-2 w-full"
  >
    {#if children}
      {@render children()}
    {:else}
      <Plus class="size-4" />
      Create {collection}
    {/if}
  </Button>
</div>
