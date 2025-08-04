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
  import Modal from "@/shared/ui/Modal.svelte";
  import DeleteRecord from "@/shared/ui/features/DeleteRecord.svelte";

  let docId = $state("");

  let sidebarScroll = $state<HTMLElement | null>(null);
  let documentsScroll = $state<HTMLElement | null>(null);

  const project = $derived(projectsProvider.selectedProject);

  const sources = $derived(sourcesProvider.sources);
  const source = $derived(sourcesProvider.selectedSource);

  const documents = $derived(
    documentsProvider.documents.filter((d) => d.source === source?.id)
  );

  const document = $derived(documents.find((d) => d.id === docId) || null);

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
      <h2 class="font-semibold text-center">Knowledge Sources</h2>
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
            ghost
            size="xl"
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
            <div class="overflow-x-auto">
              <table class="table table-zebra w-full">
                <thead>
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
                      class="hover cursor-pointer"
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
          data={{
            source: source?.id,
          }}
        />
      </footer>
    </div>
  </main>
</div>

<Modal
  class="w-full max-w-2xl"
  open={!!document}
  placement="right"
  onclose={() => (docId = "")}
>
  <div class="">
    <header class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <EditStringField
          key="title"
          ghost
          size="xl"
          record={document as RecordModel | null}
        />
        <div class={["badge", getStatusBadge(document?.status || "")]}>
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
  </div>
</Modal>
