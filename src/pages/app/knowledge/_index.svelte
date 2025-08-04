<script lang="ts">
  import type { RecordModel } from "pocketbase";
  import { Funnel } from "@lucide/svelte";

  import { sourcesProvider } from "@/knowledge/providers/sources.svelte";
  import { documentsProvider } from "@/knowledge/providers/documents.svelte";

  import Button from "@/shared/ui/Button.svelte";
  import { settingsProvider } from "@/user/settings.svelte";

  import { projectsProvider } from "@/control/providers/projects.svelte";
  import CreateRecord from "@/shared/ui/features/CreateRecord.svelte";
  import { scrollToBottom } from "@/shared/actions/scroll-bottom";
  import EditStringField from "@/shared/ui/features/EditStringField.svelte";
  import EditTextField from "@/shared/ui/features/EditTextField.svelte";
  import FileInput from "@/shared/ui/FileInput.svelte";
  import Modal from "@/shared/ui/Modal.svelte";
  import DeleteRecord from "@/shared/ui/features/DeleteRecord.svelte";
  import { pb } from "@/shared/lib/pb";
  import SetRecordField from "@/shared/ui/features/SetRecordField.svelte";
  import { actions } from "astro:actions";

  let docId = $state("");

  let sidebarScroll = $state<HTMLElement | null>(null);
  let documentsScroll = $state<HTMLElement | null>(null);

  let indexing = $state(false);

  const project = $derived(projectsProvider.selectedProject);

  const sources = $derived(sourcesProvider.sources);
  const source = $derived(sourcesProvider.selectedSource);

  const documents = $derived(
    documentsProvider.documents.filter((d) => d.source === source?.id)
  );

  const document = $derived(documents.find((d) => d.id === docId) || null);
  let docType = $derived<"manual" | "webPage" | "file">(
    document?.type || "manual"
  );

  let fileContent = $state("");
  let selectedFile = $state<File | null>(null);

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

  async function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      selectedFile = file;
      const text = await file.text();
      fileContent = text;

      // Update the document content with file content
      if (document) {
        try {
          await pb.collection("documents").update(document.id, {
            content: text,
            filename: file.name,
          });
        } catch (error) {
          console.error("Error updating document with file content:", error);
        }
      }
    }
  }

  async function indexDocument() {
    if (!document || !project) return;

    const mode = document.status === "indexed" ? "reindex" : "index";

    indexing = true;
    await actions.indexDocs({
      mode,
      orgId: project.org,
      projectId: project.id,
      docs: [
        {
          id: document.id,
          status: document.status,
          content: document.content,
          metadata: document.metadata || {},
        },
      ],
    });
    indexing = false;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "indexed":
        return "badge-success";
      case "loaded":
        return "badge-neutral";
      case "error":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  }

  function getTypeBadge(type: string) {
    switch (type) {
      case "file":
        return "badge-info";
      case "webPage":
        return "badge-primary";
      case "manual":
        return "badge-secondary";
      default:
        return "badge-neutral";
    }
  }
</script>

<div class="w-full h-full flex">
  <aside
    class="w-80 h-full bg-base-100 px-4 py-2 flex flex-col border-r border-base-300"
  >
    <div class="flex flex-col gap-4 flex-1 min-h-0">
      <h2 class="font-semibold text-center border-b border-base-300 pb-2">
        Knowledge Sources
      </h2>
      <div
        class="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0"
        bind:this={sidebarScroll}
      >
        {#each sources as source}
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

        <div>
          <DeleteRecord
            record={source as RecordModel}
            onSuccess={() => {
              settingsProvider.selectSource(sources[0].id);
            }}
          />
        </div>
      </div>

      <div>
        <h2 class="font-semibold">Filters</h2>
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
                  {#each documents as document}
                    <tr
                      class="hover cursor-pointer hover:bg-base-300"
                      onclick={() => (docId = document.id)}
                    >
                      <td class="font-medium">
                        {document.title ||
                          `Document ${document.id.slice(0, 4)}`}
                      </td>
                      <td class="max-w-xs">
                        {#if document.content}
                          <p class="text-sm line-clamp-2">
                            {document.content}
                          </p>
                        {:else}
                          <span class="text-base-content/50 text-sm"
                            >No content</span
                          >
                        {/if}
                      </td>
                      <td>
                        {#if document.status}
                          <span class="badge {getStatusBadge(document.status)}">
                            {document.status}
                          </span>
                        {:else}
                          <span class="badge badge-neutral">Unknown</span>
                        {/if}
                      </td>
                      <td>
                        {#if document.type}
                          <span class="badge {getTypeBadge(document.type)}">
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
>
  <div class="h-full flex flex-col">
    <header
      class="flex items-center justify-between px-6 py-4 border-b border-base-300"
    >
      <div class="flex items-center gap-3 relative">
        <EditStringField
          key="title"
          size="lg"
          record={document as RecordModel | null}
        />
        <div
          class={[
            "badge absolute -top-3 -right-14",
            getStatusBadge(document?.status || ""),
          ]}
        >
          {document?.status}
        </div>
      </div>

      <div>
        <DeleteRecord
          record={document as RecordModel | null}
          onSuccess={() => {
            docId = "";
          }}
        />
      </div>
    </header>

    <div class="flex-1 flex flex-col min-h-0">
      <div class="p-6 flex-1 min-h-0">
        <div class="flex gap-2 mb-6">
          <SetRecordField
            class="flex-1"
            record={document as RecordModel | null}
            key="type"
            value="manual"
            onSuccess={(rec) => {
              docType = rec.type;
            }}
            disabled={document?.status === "indexed"}
            style={docType === "manual" ? "soft" : "ghost"}
            color={docType === "manual" ? "primary" : "neutral"}
          >
            Manual
          </SetRecordField>
          <SetRecordField
            class="flex-1"
            record={document as RecordModel | null}
            key="type"
            value="webPage"
            onSuccess={(rec) => {
              docType = rec.type;
            }}
            disabled={document?.status === "indexed"}
            style={docType === "webPage" ? "soft" : "ghost"}
            color={docType === "webPage" ? "primary" : "neutral"}
          >
            Web Page
          </SetRecordField>
          <SetRecordField
            class="flex-1"
            record={document as RecordModel | null}
            key="type"
            value="file"
            onSuccess={(rec) => {
              docType = rec.type;
            }}
            disabled={document?.status === "indexed"}
            style={docType === "file" ? "soft" : "ghost"}
            color={docType === "file" ? "primary" : "neutral"}
          >
            File
          </SetRecordField>
        </div>

        <div class="flex flex-col gap-4 flex-1 min-h-0">
          {#if document}
            {#if docType === "manual"}
              <div class="flex flex-col gap-2">
                <EditTextField
                  key="content"
                  record={document as RecordModel}
                  class="flex-1 min-h-0"
                  rows={20}
                  placeholder="Enter your content here..."
                >
                  Your content to index...
                </EditTextField>
              </div>
            {:else if docType === "webPage"}
              <div class="flex flex-col gap-4">
                <div class="flex gap-2 items-center">
                  <EditStringField
                    key="url"
                    record={document as RecordModel}
                    placeholder="https://example.com"
                  >
                    URL
                  </EditStringField>

                  <Button
                    style="soft"
                    onclick={() => {
                      if (!document) return;
                      console.log("Crawling");
                    }}
                  >
                    Crawl
                  </Button>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                  <EditTextField
                    key="content"
                    record={document as RecordModel}
                    class="flex-1 min-h-0"
                    rows={20}
                    placeholder="Content from web page..."
                  >
                    Content from web page...
                  </EditTextField>
                </div>
              </div>
            {:else if docType === "file"}
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <FileInput
                    accept=".txt,.md,.pdf,.doc,.docx"
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
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                  <EditTextField
                    key="content"
                    record={document as RecordModel}
                    class="flex-1 min-h-0"
                    rows={20}
                    placeholder="File content will appear here..."
                  >
                    File content will appear here...
                  </EditTextField>
                </div>
              </div>
            {/if}
          {/if}
        </div>
      </div>

      <footer class="p-6 border-t border-base-300 bg-base-50">
        {#if document?.status === "indexed"}
          <Button
            color="secondary"
            size="lg"
            class="w-full"
            onclick={indexDocument}
            disabled={!document || indexing}
          >
            Reindex
          </Button>
        {:else}
          <Button
            size="lg"
            class="w-full"
            onclick={indexDocument}
            disabled={!document || indexing}
          >
            Index
          </Button>
        {/if}
      </footer>
    </div>
  </div>
</Modal>
