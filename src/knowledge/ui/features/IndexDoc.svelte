<script lang="ts">
  import { actions } from "astro:actions";
  import type { ClassValue } from "svelte/elements";

  import type {
    DocumentsResponse,
    ProjectsResponse,
  } from "@/shared/models/pocketbase-types";
  import Button from "@/shared/ui/Button.svelte";

  interface Props {
    class?: ClassValue;
    document: DocumentsResponse | null;
    project: ProjectsResponse | null;
    indexing?: boolean;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
    cleanForm?: boolean;
  }

  let {
    class: classNames,
    document,
    project,
    indexing = $bindable(false),
    onSuccess,
    onError,
    cleanForm = true,
  }: Props = $props();

  async function indexDocument() {
    if (!document || !project || indexing) return;

    const mode = document.status === "indexed" ? "reindex" : "index";

    indexing = true;
    const result = await actions.indexDocs({
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
    if ((result.data as { ok: boolean }).ok) {
      onSuccess?.();
    } else {
      onError?.(result.error);
    }
    indexing = false;
  }
</script>

<div class={classNames}>
  <Button
    color="secondary"
    size="lg"
    block
    onclick={indexDocument}
    disabled={!document || !project || indexing || !cleanForm}
  >
    {document?.status === "indexed" ? "Reindex" : "Index"}
  </Button>
</div>
