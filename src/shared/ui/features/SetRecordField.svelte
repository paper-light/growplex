<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import type { RecordModel } from "pocketbase";

  import { pb } from "@/shared/lib/pb";
  import Button from "@/shared/ui/Button.svelte";

  interface Props {
    class?: ClassValue;
    record: RecordModel | null;
    key: string;
    value: string;
    children?: Snippet;
    style?: "solid" | "outline" | "ghost" | "link" | "dash" | "soft";
    color?:
      | "primary"
      | "secondary"
      | "accent"
      | "info"
      | "success"
      | "warning"
      | "error"
      | "neutral";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    onSuccess?: (rec: RecordModel) => void;
    onError?: (error: unknown) => void;
    disabled?: boolean;
  }

  const {
    record,
    key,
    value,
    class: className,
    children,
    style = "solid",
    color = "neutral",
    size = "md",
    onSuccess,
    onError,
    disabled,
  }: Props = $props();

  async function updateValue() {
    if (!record || disabled) return;

    try {
      const rec = await pb.collection("documents").update(record.id, {
        [key]: value,
      });
      onSuccess?.(rec as RecordModel);
    } catch (error) {
      onError?.(error);
    }
  }
</script>

<div class={className}>
  <Button
    class="w-full"
    {style}
    {color}
    {size}
    onclick={updateValue}
    {disabled}
  >
    {#if children}
      {@render children()}
    {:else}
      <span>Set {key} to {value}</span>
    {/if}
  </Button>
</div>
