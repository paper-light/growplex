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
  let content = $derived(document?.previewContent || "");

  let selectedFile = $state<File | null>(null);

  let indexing = $state(false);
  let crawling = $state(false);
  let docType = $derived(document?.type || "manual");

  const isFormDirty = $derived(
    title !== document?.title ||
      url !== document?.url ||
      content !== document?.previewContent ||
      docType !== document?.type
  );

  $effect(() => {
    if (document?.file) {
      const url = pb.files.getURL(document, document.file);
      fetch(url)
        .then((res) => res.blob())
        .then((file) => {
          selectedFile = new File([file], document.id);
        });
    }
  });

  async function saveDocument(e: Event) {
    e.preventDefault();
    if (!document) return;

    const formData = new FormData(e.target as HTMLFormElement);

    const content = formData.get("content")?.toString();
    if (content !== document.previewContent) {
      const blob = new Blob([content ?? ""], { type: "text/plain" });
      const file = new File([blob], `${document.id}.txt`, {
        type: "text/plain",
      });
      formData.set("file", file);
    }

    try {
      const updatedDocument = await pb
        .collection("documents")
        .update(document.id, formData);
      onSaveSuccess?.(updatedDocument);
    } catch (error) {
      onSaveError?.(error);
    }
  }

  async function handleFileSelect(e: Event) {
    if (!document?.id) return;

    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      let content: string;

      if (
        file.type.startsWith("text/") ||
        [".txt", ".md", ".json", ".xml", ".html", ".csv"].some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        )
      ) {
        content = await file.text();
      } else if (file.type === "application/pdf") {
        throw new Error("PDF files not yet supported");
      } else if (file.type.startsWith("image/")) {
        throw new Error("Image files not yet supported");
      } else {
        const arrayBuffer = await file.arrayBuffer();
        content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      }

      const fileExtension = file.name.split(".").pop() || "txt";
      const newFile = new File([content], `${document?.id}.${fileExtension}`, {
        type: file.type,
      });

      await pb.collection("documents").update(document?.id, {
        type: "file",
        file: newFile,
        previewContent: content,
        status: ["indexed", "unsynced"].includes(document.status || "")
          ? "unsynced"
          : "idle",
      });
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

{#if document}
  <div class={className}>
    <form class="w-full h-full flex flex-col" onsubmit={saveDocument}>
      <header
        class="flex items-center justify-between px-6 py-4 border-b border-base-300"
      >
        <div class="flex items-center gap-3 relative">
          <Input
            size="lg"
            name="title"
            placeholder="Title"
            bind:value={title}
          />
          <div
            class={[
              "badge absolute -top-3 -right-11",
              docStatusBadgeClasses(document.status || ""),
            ]}
          >
            {document.status}
          </div>
        </div>

        <div>
          <DeleteRecord
            record={document as RecordModel}
            onSuccess={() => {
              onDeleteSuccess?.();
            }}
          />
        </div>
      </header>

      {#if ["indexed", "unsynced"].includes(document.status || "")}
        <div class="flex items-center gap-2">
          <p class="text-sm text-base-content/50">
            {document.chunkCount} chunks
          </p>
          <p class="text-sm text-base-content/50">
            {document.tokenCount} tokens
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
                  accept={".txt,.md,.json,.xml,.html,.csv"}
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
          </div>
        </div>

        <footer class="p-6 border-t border-base-300 space-y-2">
          <Button
            type="submit"
            color="primary"
            size="lg"
            block
            disabled={indexing || !isFormDirty}>Save document</Button
          >
          <IndexDoc cleanForm={!isFormDirty} {document} bind:indexing />
        </footer>
      </div>
    </form>
  </div>
{:else}
  <div class={className}>
    <div class="w-full h-full flex items-center justify-center">
      <p class="text-base-content/70">No document selected</p>
    </div>
  </div>
{/if}
