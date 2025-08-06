<script lang="ts">
  import { actions } from "astro:actions";
  import type { RecordModel } from "pocketbase";
  import type { ClassValue } from "svelte/elements";

  import Input from "@/shared/ui/Input.svelte";
  import type { DocumentsResponse } from "@/shared/models/pocketbase-types";
  import DeleteRecord from "@/shared/ui/features/DeleteRecord.svelte";
  import Button from "@/shared/ui/Button.svelte";
  import FileInput from "@/shared/ui/FileInput.svelte";
  import { pb } from "@/shared/lib/pb";
  import { docStatusBadgeClasses } from "@/knowledge/helpers/doc-status-badge";
  import IndexDoc from "@/knowledge/ui/features/IndexDoc.svelte";
  import TextArea from "@/shared/ui/TextArea.svelte";

  import SelectDocType from "./features/SelectDocType.svelte";

  interface Props {
    document: DocumentsResponse | null;

    class?: ClassValue;

    onSaveSuccess?: (document: DocumentsResponse) => void;
    onDeleteSuccess?: () => void;
    onSaveError?: (error: unknown) => void;
  }

  const {
    document,
    class: className,
    onSaveSuccess,
    onDeleteSuccess,
    onSaveError,
  }: Props = $props();

  let title = $derived(document?.title || "");
  let url = $derived(document?.url || "");
  let content = $derived(document?.content || "");

  let selectedFile = $state<File | null>(null);

  let indexing = $state(false);
  let crawling = $state(false);
  let docType = $derived(document?.type || "manual");

  const isFormDirty = $derived(
    title !== document?.title ||
      url !== document?.url ||
      content !== document?.content ||
      docType !== document?.type
  );

  async function saveDocument(e: Event) {
    e.preventDefault();
    if (!document) return;

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const updatedDocument = await pb
        .collection("documents")
        .update(document.id, formData);
      onSaveSuccess?.(updatedDocument);
    } catch (error) {
      onSaveError?.(error);
    }
  }

  function handleFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      selectedFile = file;
    }
  }

  async function crawlDocument() {
    crawling = true;
    const res = await actions.crawlUrl({
      url,
      sourceId: document?.source,
      documentId: document?.id,
    });
    crawling = false;
  }
</script>

<div class={className}>
  <form class="w-full h-full flex flex-col" onsubmit={saveDocument}>
    <header
      class="flex items-center justify-between px-6 py-4 border-b border-base-300"
    >
      <div class="flex items-center gap-3 relative">
        <Input size="lg" name="title" placeholder="Title" bind:value={title} />
        <div
          class={[
            "badge absolute -top-3 -right-11",
            docStatusBadgeClasses(document?.status || ""),
          ]}
        >
          {document?.status}
        </div>
      </div>

      <div>
        <DeleteRecord
          record={document as RecordModel | null}
          onSuccess={() => {
            onDeleteSuccess?.();
          }}
        />
      </div>
    </header>

    {#if ["indexed", "unsynced"].includes(document?.status || "")}
      <div class="flex items-center gap-2">
        <p class="text-sm text-base-content/50">
          {document?.chunkCount} chunks
        </p>
        <p class="text-sm text-base-content/50">
          {document?.tokenCount} tokens
        </p>
      </div>
    {/if}

    <div class="flex-1 flex flex-col min-h-0">
      <div class="p-6 flex-1 min-h-0">
        <SelectDocType
          mode="form"
          class="flex gap-2 mb-6"
          {document}
          bind:docType
        />

        <div class="flex flex-col gap-4 flex-1 min-h-0">
          {#if document}
            {#if docType === "webPage"}
              <div class="flex gap-2 items-center">
                <Input
                  name="url"
                  placeholder="https://example.com"
                  bind:value={url}
                >
                  URL
                </Input>

                <Button
                  style="soft"
                  onclick={crawlDocument}
                  disabled={crawling}
                  color={crawling ? "info" : "primary"}
                >
                  {crawling ? "Crawling..." : "Crawl"}
                </Button>
              </div>
            {:else if docType === "file"}
              <div class="flex flex-col gap-2">
                <FileInput
                  accept=".txt,.md,.pdf,.doc,.docx,.csv,.json,.xml,.xlsx"
                  onchange={handleFileSelect}
                  class="w-full"
                >
                  Choose file...
                </FileInput>
                {#if selectedFile}
                  <p class="text-sm text-base-content/70">
                    Selected: {selectedFile.name}
                  </p>
                {/if}
              </div>
            {/if}

            <div class="flex flex-col gap-2 flex-1 min-h-0">
              <TextArea
                disabled={docType !== "manual"}
                color="neutral"
                name="content"
                class="w-full flex-1 min-h-0"
                rows={20}
                placeholder="Content"
                bind:value={content}
              >
                {docType === "manual"
                  ? "Write your content to index..."
                  : "Loaded content"}
              </TextArea>
            </div>
          {/if}
        </div>
      </div>

      <footer class="p-6 border-t border-base-300 space-y-2">
        <Button
          type="submit"
          color="primary"
          size="lg"
          block
          disabled={!document || indexing || !isFormDirty}>Save document</Button
        >
        <IndexDoc cleanForm={!isFormDirty} {document} bind:indexing />
      </footer>
    </div>
  </form>
</div>
