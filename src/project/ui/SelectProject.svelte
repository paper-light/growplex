<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Dropdown from "@/shared/ui/Dropdown.svelte";
  import { settingsProvider } from "@/user/settings.svelte";
  import { projectsProvider } from "@/control/providers/projects.svelte";
  import CreateRecord from "@/shared/ui/features/CreateRecord.svelte";
  import { userProvider } from "@/user/user.svelte";

  interface Props {
    class?: ClassValue;
  }
  const { class: className }: Props = $props();

  let open = $state(false);

  const projects = $derived(projectsProvider.projects);
  const selectedProjectId = $derived(projectsProvider.selectedProject?.id);
  const selectedOrgId = $derived(userProvider.selectedOrg?.id);
</script>

<div class={className}>
  <Dropdown
    bind:open
    class="w-42 border border-base-300 rounded-md"
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

    {#snippet actions()}
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
