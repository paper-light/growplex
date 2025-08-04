<script lang="ts">
  import type { RecordModel } from "pocketbase";
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  import { debounce } from "@/shared/helpers/debounce";
  import { pb } from "@/shared/lib/pb";
  import TextArea from "@/shared/ui/TextArea.svelte";

  const DEBOUNCE_TIME = 1.2 * 1000;

  interface Props {
    class?: ClassValue;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    color?: "primary" | "secondary" | "accent" | "neutral" | "error";
    ghost?: boolean;
    required?: boolean;
    name?: string;
    placeholder?: string;
    children?: Snippet;
    rows?: number;
    grow?: boolean;

    key: string;
    record: RecordModel;
    onSuccess?: (record: RecordModel) => void;
    onError?: (error: unknown) => void;
    mode?: "debounce" | "form";
  }

  let {
    record,
    class: className = "",
    size = "md",
    color = "neutral",
    ghost = false,
    name,
    placeholder = "Name",
    onSuccess,
    onError,
    required = false,
    mode = "debounce",
    children,
    rows = 4,
    grow = false,
    key,
  }: Props = $props();

  const value = $derived(record[key] ?? "");

  const updateName = async (e: Event) => {
    console.log("updateName", e);
    const newValue = (e.target as HTMLInputElement).value;

    if (newValue === value) return;

    try {
      const updatedRecord = await pb
        .collection(record.collectionId)
        .update(record.id, {
          [key]: newValue,
        });
      onSuccess?.(updatedRecord);
    } catch (error) {
      onError?.(error);
    }
  };
  const updateNameDebounced = debounce(updateName, DEBOUNCE_TIME);
</script>

<div class={className}>
  <TextArea
    class="w-full"
    {color}
    {ghost}
    oninput={mode === "debounce" ? updateNameDebounced : undefined}
    {value}
    {size}
    {name}
    {required}
    {placeholder}
    {rows}
    {grow}
  >
    {#if children}
      {@render children()}
    {:else}
      <span>Write here...</span>
    {/if}
  </TextArea>
</div>
