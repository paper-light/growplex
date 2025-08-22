<script lang="ts">
  import type { RecordModel } from "pocketbase";
  import { Funnel } from "@lucide/svelte";

  import { sourcesProvider } from "@/source/providers/sources.svelte";
  import { documentsProvider } from "@/document/providers/documents.svelte";

  import Button from "@/shared/ui/Button.svelte";
  import { settingsProvider } from "@/user/settings.svelte";

  import { projectsProvider } from "@/project/providers/projects.svelte";
  import CreateRecord from "@/shared/ui/features/CreateRecord.svelte";
  import { scrollToBottom } from "@/shared/actions/scroll-bottom";
  import EditStringField from "@/shared/ui/features/EditStringField.svelte";
  import Modal from "@/shared/ui/Modal.svelte";
  import DeleteRecord from "@/shared/ui/features/DeleteRecord.svelte";
  import DocumentForm from "@/document/ui/DocumentForm.svelte";
  import { docStatusBadgeClasses } from "@/document/helpers/doc-status-badge";
  import { docTypeBadgeClasses } from "@/document/helpers/doc-type-badge";
  import DomainConnect from "@/source/ui/DomainConnect.svelte";
  import Pagination from "@/shared/ui/features/Pagination.svelte";

  let docId = $state("");

  // Pagination state
  let currentPage = $state(1);

  let sidebarScroll = $state<HTMLElement | null>(null);
  let documentsScroll = $state<HTMLElement | null>(null);

  const project = $derived(projectsProvider.selectedProject);

  const sources = $derived(sourcesProvider.sources);
  const source = $derived(sourcesProvider.selectedSource);

  const filteredSources = $derived(sources);

  const sortedSources = $derived(filteredSources);

  const documents = $derived(
    documentsProvider.documentsMap.get(source?.id || "") || []
  );
  const paginatedDocuments = $derived(
    documents.slice(
      (currentPage - 1) * documentsProvider.pageSize,
      currentPage * documentsProvider.pageSize
    )
  );

  // Pagination computed values
  const totalPages = $derived(
    Math.ceil(documents.length / documentsProvider.pageSize)
  );

  const stats = $derived.by(() => {
    const docs = documents.filter((d) =>
      ["indexed", "unsynced"].includes(d.status)
    );
    return docs.reduce(
      (acc, doc) => {
        acc.totalChunks += doc.chunkCount;
        acc.totalTokens += doc.tokenCount;
        acc.averageChunkTokens = acc.totalTokens / acc.totalChunks;
        acc.averageDocumentChunks = acc.totalChunks / docs.length;
        return acc;
      },
      {
        totalTokens: 0,
        totalChunks: 0,
        averageChunkTokens: 0,
        averageDocumentChunks: 0,
      }
    );
  });

  const document = $derived(documents.find((d) => d.id === docId) || null);

  // Reset to first page when source changes
  $effect(() => {
    if (source) {
      currentPage = 1;
    }
  });

  $effect(() => {
    if (sources.length > 0) {
      scrollToBottom(sidebarScroll);
    }
  });

  $effect(() => {
    if (documents.length > 0) {
      scrollToBottom(documentsScroll);
    }
  });
</script>

<div class="w-full h-full flex">
  <aside
    class="w-80 h-full bg-base-100 px-4 py-2 flex flex-col border-r border-base-300 bg-base-200"
  >
    <div class="flex flex-col gap-4 flex-1 min-h-0">
      <h2 class="font-semibold text-center border-b border-base-300 pb-2">
        Knowledge Sources
      </h2>
      <div
        class="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0"
        bind:this={sidebarScroll}
      >
        {#each sortedSources as source}
          {@const isSelected = settingsProvider.selectedSourceId === source.id}
          <Button
            style={isSelected ? "soft" : "ghost"}
            color={isSelected ? "primary" : "neutral"}
            onclick={() => settingsProvider.selectSource(source.id)}
            class="flex flex-col gap-2 w-full"
          >
            <h2 class="truncate text-left max-w-full">
              {source.name || `Source ${source.id.slice(0, 4)}`}
            </h2>
          </Button>
        {/each}
      </div>
      <CreateRecord
        class="mb-4"
        projectId={project?.id || ""}
        collection="sources"
        onSuccess={(source) => {
          settingsProvider.selectSource(source.id);
        }}
      />
    </div>
  </aside>

  <main class="flex-1 h-full flex flex-col">
    <header class="px-4 py-2 border-b border-base-300 bg-base-100 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <EditStringField
            class="font-semibold"
            key="name"
            size="lg"
            record={source as RecordModel}
          />
        </div>

        <div class="flex items-center gap-2">
          <DomainConnect
            style="outline"
            projectId={project?.id || ""}
            sourceId={source?.id}
          />
          <DeleteRecord
            msg="Are you sure you want to delete this source? All documents will be deleted as well."
            record={source as RecordModel}
            onSuccess={() => {
              settingsProvider.selectSource(sources[0].id);
            }}
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-sm text-base-content/50">
          <p>
            {documents.length}
          </p>
          <p>docs</p>
        </div>
        <div class="text-sm text-base-content/50">
          <p>
            {stats.totalTokens}
          </p>
          <p>tkns</p>
        </div>
        <div class="text-sm text-base-content/50">
          <p>
            {stats.totalChunks}
          </p>
          <p>chnks</p>
        </div>
        <div class="text-sm text-base-content/50">
          <p>
            {stats.averageChunkTokens.toFixed(2)}
          </p>
          <p>tkns/chnk</p>
        </div>
        <div class="text-sm text-base-content/50">
          <p>
            {stats.averageDocumentChunks.toFixed(2)}
          </p>
          <p>chnks/doc</p>
        </div>
      </div>

      <h2 class="font-semibold text-lg">Documents</h2>

      <div class="hidden">
        <h3 class="font-semibold">Filters</h3>
        <div class="flex items-center gap-2">
          <Button size="sm" color="neutral" style="outline">
            <Funnel class="size-4" />
            <span>Filter</span>
          </Button>
        </div>
      </div>
    </header>

    <div class="flex-1 flex flex-col min-h-0 p-4">
      <div class="flex flex-col gap-4 flex-1 min-h-0">
        <div
          class="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto"
          bind:this={documentsScroll}
        >
          {#if documents.length > 0}
            <div class="overflow-x-auto flex-1">
              <table class="table table-zebra w-full">
                <thead class="sticky top-0 bg-base-100 z-10">
                  <tr>
                    <th>Title</th>
                    <th>Content</th>
                    <th>Status</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {#each paginatedDocuments as document}
                    <tr
                      class="hover cursor-pointer hover:bg-base-300"
                      onclick={() => (docId = document.id)}
                    >
                      <td class="font-medium">
                        {document.title ||
                          `Document ${document.id.slice(0, 4)}`}
                      </td>
                      <td class="max-w-xs">
                        {#if document.previewContent}
                          <p class="text-sm line-clamp-2">
                            {document.previewContent}
                          </p>
                        {:else}
                          <span class="text-base-content/50 text-sm"
                            >No content</span
                          >
                        {/if}
                      </td>
                      <td>
                        {#if document.status}
                          <span
                            class="badge {docStatusBadgeClasses(
                              document.status
                            )}"
                          >
                            {document.status}
                          </span>
                        {:else}
                          <span class="badge badge-neutral">Unknown</span>
                        {/if}
                      </td>
                      <td>
                        {#if document.type}
                          <span
                            class="badge {docTypeBadgeClasses(document.type)}"
                          >
                            {document.type}
                          </span>
                        {:else}
                          <span class="badge badge-neutral">Unknown</span>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>

            <Pagination
              bind:page={currentPage}
              {totalPages}
              itemsLength={documents.length}
            />
          {:else}
            <div class="flex flex-col gap-2 p-4 text-center">
              <h2 class="text-lg font-bold">No documents found</h2>
              <p class="text-base-content/70">
                Create your first document to get started
              </p>
            </div>
          {/if}
        </div>
      </div>

      <footer class="p-4 border-t border-base-300 bg-base-50">
        <CreateRecord
          onSuccess={() => {
            currentPage = totalPages;
          }}
          projectId={project?.id || ""}
          collection="documents"
          size="lg"
          data={{
            source: source?.id,
          }}
        />
      </footer>
    </div>
  </main>
</div>

<Modal
  class="w-full max-w-4xl h-full"
  open={!!document}
  placement="right"
  onclose={() => (docId = "")}
  backdrop
>
  <DocumentForm
    class="h-full"
    {document}
    onDeleteSuccess={() => {
      docId = "";
    }}
  />
</Modal>
