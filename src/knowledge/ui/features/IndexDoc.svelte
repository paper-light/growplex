<script lang="ts">
  import { actions } from "astro:actions";
  import type { ClassValue } from "svelte/elements";

  import type { DocumentsResponse } from "@/shared/models/pocketbase-types";
  import Button from "@/shared/ui/Button.svelte";

  interface Props {
    class?: ClassValue;

    document: DocumentsResponse | null;
    indexing?: boolean;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
    cleanForm?: boolean;
  }

  let {
    class: classNames,
    document,
    indexing = $bindable(false),
    onSuccess,
    onError,
    cleanForm = true,
  }: Props = $props();

  const disabled = $derived(
    !document ||
      indexing ||
      !cleanForm ||
      !["idle", "unsynced"].includes(document.status)
  );

  async function indexDocument() {
    if (disabled) return;

    indexing = true;
    const result = await actions.indexDocs({
      sourceId: document!.source,
      docs: [document!],
    });
    if ((result.data as { ok: boolean })?.ok) {
      onSuccess?.();
    } else {
      console.error(result?.error);
      onError?.(result?.error);
    }
    indexing = false;
  }
</script>

<div class={classNames}>
  <Button color="secondary" size="lg" block onclick={indexDocument} {disabled}>
    {["indexed", "unsynced"].includes(document?.status || "")
      ? "Reindex"
      : "Index"}
  </Button>
</div>
