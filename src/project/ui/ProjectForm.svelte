<script lang="ts">
  import { Edit } from "@lucide/svelte";
  import type { ClassValue } from "svelte/elements";

  import { pb } from "@/shared/lib/pb";
  import type { ProjectsResponse } from "@/shared/models/pocketbase-types";
  import Input from "@/shared/ui/Input.svelte";
  import Button from "@/shared/ui/Button.svelte";

  interface Props {
    project: ProjectsResponse | null;
    class?: ClassValue;
    onSaveSuccess?: (project: ProjectsResponse) => void;
    onSaveError?: (error: unknown) => void;
    onCancel?: () => void;
  }

  const {
    project,
    class: className,
    onSaveSuccess,
    onSaveError,
  }: Props = $props();

  let name = $derived(project?.name || "");

  async function saveProject(e: Event) {
    e.preventDefault();

    if (!project || name.trim().length === 0 || name === project.name) return;

    try {
      const updatedProject = await pb
        .collection("projects")
        .update(project.id!, {
          name,
        });
      onSaveSuccess?.(updatedProject);
    } catch (error) {
      console.error(error);
      onSaveError?.(error);
    }
  }
</script>

<div class={className}>
  <form class="w-full h-full flex flex-col gap-4" onsubmit={saveProject}>
    <h3 class="text-lg font-semibold">Edit Project</h3>

    <Input
      name="name"
      size="lg"
      placeholder="Default Project"
      bind:value={name}
      class="w-full"
      labelPosition="right"
    >
      <Edit size={16} />
    </Input>

    <Button type="submit" color="primary">Save</Button>
  </form>
</div>
