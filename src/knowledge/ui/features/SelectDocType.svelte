<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Button from "@/shared/ui/Button.svelte";
  import type { DocumentsResponse } from "@/shared/models/pocketbase-types";
  import { pb } from "@/shared/lib/pb";

  interface Props {
    class?: ClassValue;
    document: DocumentsResponse | null;
    docType?: string;
    onDocTypeChange?: (docType: string) => void;
    mode?: "form" | "action";
  }

  let {
    class: classNames,
    document,
    docType = $bindable("manual"),
    onDocTypeChange,
    mode = "form",
  }: Props = $props();

  const types: { value: string; label: string }[] = [
    { value: "manual", label: "Manual" },
    { value: "webPage", label: "Web Page" },
    { value: "file", label: "File" },
  ];
</script>

<div class={classNames}>
  {#if mode === "form"}
    <input name="type" class="hidden" type="text" bind:value={docType} />
  {/if}
  {#each types as type}
    <Button
      class="flex-1"
      color={docType === type.value ? "primary" : "neutral"}
      style={docType === type.value ? "soft" : "ghost"}
      disabled={document?.status === "indexed"}
      onclick={() => {
        if (!document) return;
        if (mode === "action") {
          pb.collection("documents").update(document.id, {
            type: type.value,
          });
        } else {
          docType = type.value;
        }
        onDocTypeChange?.(type.value);
      }}
    >
      {type.label}
    </Button>
  {/each}
</div>
