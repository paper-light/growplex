<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import type { ProjectsResponse } from "@/shared/models/pocketbase-types";
  import Dropdown from "@/shared/ui/Dropdown.svelte";
  import { settingsProvider } from "@/user/settings.svelte";
  import { projectsProvider } from "@/project/providers/projects.svelte";
  import CreateRecord from "@/shared/ui/features/CreateRecord.svelte";
  import { userProvider } from "@/user/user.svelte";
  import Button from "@/shared/ui/Button.svelte";
  import Modal from "@/shared/ui/Modal.svelte";

  import ProjectForm from "./ProjectForm.svelte";

  interface Props {
    class?: ClassValue;
  }
  const { class: className }: Props = $props();

  let open = $state(false);

  const projects = $derived(projectsProvider.projects);
  const selectedProjectId = $derived(projectsProvider.selectedProject?.id);
  const selectedOrgId = $derived(userProvider.selectedOrg?.id);

  let modalProject: ProjectsResponse | null = $state(null);
</script>

<div class={className}>
  <Dropdown
    bind:open
    class="w-50 border border-base-300 rounded-md"
    selected={selectedProjectId}
    options={projects.map((p) => ({
      value: p.id,
      label: p.name,
    }))}
    onselect={(projectId) => {
      settingsProvider.selectProject(projectId);
      open = false;
    }}
  >
    {#snippet badge()}
      <span class="absolute left-0 -top-1 text-info font-semibold text-xs">
        project
      </span>
    {/snippet}

    {#snippet rowActions(projectId, isSelected)}
      <Button
        square
        size="sm"
        color={isSelected ? "primary" : "neutral"}
        style="ghost"
        onclick={() => {
          modalProject = projects.find((p) => p.id === projectId) || null;
        }}
      >
        <Pencil size={14} />
      </Button>
    {/snippet}

    {#snippet endActions()}
      <CreateRecord
        onSuccess={(record) => {
          settingsProvider.selectProject(record.id);
          open = false;
        }}
        collection="projects"
        data={{
          org: selectedOrgId,
        }}
      >
        + Create</CreateRecord
      >
    {/snippet}
  </Dropdown>
</div>

<Modal
  class="w-md h-full"
  open={!!modalProject}
  placement="left"
  onclose={() => (modalProject = null)}
  backdrop
>
  <ProjectForm
    class="h-full"
    project={modalProject}
    onSaveSuccess={() => (modalProject = null)}
    onSaveError={() => (modalProject = null)}
    onCancel={() => (modalProject = null)}
  />
</Modal>
