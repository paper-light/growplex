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
    record: RecordModel | null;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
    children?: Snippet;
    confirm?: boolean;
  }

  const {
    record,
    class: className,
    onSuccess,
    onError,
    children,
    confirm = true,
  }: Props = $props();

  let confirmOpen = $state(false);

  const deleteRecord = async () => {
    if (!record) return;

    try {
      await pb.collection(record.collectionId).delete(record.id);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    }

    confirmOpen = false;
  };
</script>

<div class={className}>
  <Button
    color="error"
    style="outline"
    onclick={() => {
      if (confirm) {
        confirmOpen = true;
      } else {
        deleteRecord();
      }
    }}
  >
    {#if children}
      {@render children()}
    {:else}
      Delete <Trash2 class="size-4" />
    {/if}
  </Button>
</div>

<Modal open={confirmOpen} onclose={() => (confirmOpen = false)}>
  <div class="flex flex-col gap-4">
    <h2 class="font-semibold">Delete {record?.title || record?.name}</h2>
    <p>Are you sure you want to delete this record?</p>
    <div class="flex justify-end">
      <Button color="error" style="outline" onclick={deleteRecord}>
        <Trash2 class="size-4" />
        Delete
      </Button>
    </div>
  </div>
</Modal>
