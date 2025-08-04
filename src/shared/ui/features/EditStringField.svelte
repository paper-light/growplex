<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import { debounce } from "@/shared/helpers/debounce";
  import Input from "@/shared/ui/Input.svelte";
  import type { RecordModel } from "pocketbase";
  import { pb } from "@/shared/lib/pb";

  const DEBOUNCE_TIME = 1.2 * 1000;

  interface Props {
    class?: ClassValue;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    color?: "primary" | "secondary" | "accent" | "neutral" | "error";
    ghost?: boolean;
    required?: boolean;
    name?: string;
    labelPosition?: "right" | "left";
    placeholder?: string;
    children?: Snippet;
    disabled?: boolean;

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
    labelPosition = "right",
    placeholder = "Name",
    onSuccess,
    onError,
    required = false,
    mode = "debounce",
    children,
    disabled = false,
    key,
  }: Props = $props();

  const value = $derived(record ? (record[key] ?? "") : "");

  const updateName = async (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value;

    if (newValue === value || disabled) return;

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
  <Input
    {color}
    {ghost}
    oninput={mode === "debounce" ? updateNameDebounced : undefined}
    {value}
    {size}
    {name}
    {required}
    {placeholder}
    {labelPosition}
    {disabled}
  >
    {#if children}
      {@render children()}
    {:else}
      <Pencil class="size-5" />
    {/if}
  </Input>
</div>
