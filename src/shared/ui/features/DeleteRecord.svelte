<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import type { RecordModel } from "pocketbase";
  import { Trash2 } from "@lucide/svelte";

  import Button from "@/shared/ui/Button.svelte";
  import { pb } from "@/shared/lib/pb";
  import Modal from "@/shared/ui/Modal.svelte";

  interface Props {
    class?: ClassValue;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    color?:
      | "primary"
      | "secondary"
      | "accent"
      | "info"
      | "success"
      | "warning"
      | "error"
      | "neutral";
    style?: "solid" | "outline" | "ghost" | "link" | "dash" | "soft";
    square?: boolean;
    circle?: boolean;

    record: RecordModel | null;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
    children?: Snippet;
    confirm?: boolean;
    msg?: string;
  }

  const {
    record,
    class: className,
    onSuccess,
    onError,
    children,
    confirm = true,
    size = "md",
    color = "error",
    style = "outline",
    square = false,
    circle = false,
    msg = "Are you sure you want to delete this record?",
  }: Props = $props();

  let confirmOpen = $state(false);
  let deleting = $state(false);

  const deleteRecord = async () => {
    if (!record) return;

    deleting = true;
    confirmOpen = false;

    try {
      await pb.collection(record.collectionId).delete(record.id);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    }

    deleting = false;
  };
</script>

<div class={className}>
  <Button
    {color}
    {style}
    {size}
    {square}
    {circle}
    disabled={deleting}
    onclick={(e: MouseEvent) => {
      e.stopPropagation();
      if (confirm) {
        confirmOpen = true;
      } else {
        deleteRecord();
      }
    }}
  >
    {#if deleting}
      Deleting...
    {:else if children}
      {@render children()}
    {:else}
      Delete <Trash2 class="size-4" />
    {/if}
  </Button>
</div>

<Modal open={confirmOpen} onclose={() => (confirmOpen = false)} backdrop>
  <div class="flex flex-col gap-4">
    <h2 class="font-semibold">Delete {record?.title || record?.name}</h2>
    <p>{msg}</p>
    <div class="flex justify-end">
      <Button {color} {style} onclick={deleteRecord} disabled={deleting}>
        {#if deleting}
          Deleting...
        {:else}
          <Trash2 class="size-4" />
          Delete
        {/if}
      </Button>
    </div>
  </div>
</Modal>
