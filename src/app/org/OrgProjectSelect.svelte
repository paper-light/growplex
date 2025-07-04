<script lang="ts">
  import z from "zod";
  import { onMount } from "svelte";
  import { ChevronDown, Check, Edit, X, Trash2 } from "@lucide/svelte";

  import {
    IntegrationSchema,
    ProjectSchema,
    type OrgSchema,
  } from "../../models";

  import { settingsProvider } from "../settings/settings.svelte";
  import { authProvider } from "../auth/auth.svelte";
  import { pb } from "../auth/pb";

  const currentOrg = $derived(settingsProvider.currentOrg);
  const currentProject = $derived(settingsProvider.currentProject);

  const orgs = $derived(
    authProvider.user?.expand?.orgMembers?.map((om) => om.expand?.org) || []
  );
  const projects = $derived(
    authProvider.user?.expand?.orgMembers?.find(
      (om) => om.org === currentOrg?.id
    )?.expand?.org?.expand?.projects || []
  );

  let openOrg = $state(false);
  let openProject = $state(false);

  let orgEl: HTMLElement;
  let projEl: HTMLElement;

  let creatingProjects = $state<{ id: string; name: string }[]>([]);

  // Editing state
  let editingOrgId = $state<string | null>(null);
  let editingProjectId = $state<string | null>(null);
  let editedOrgName = $state<string>("");
  let editedProjectName = $state<string>("");

  let showDeleteProjectModal = $state(false);
  let projectToDelete = $state<z.infer<typeof ProjectSchema> | null>(null);

  function toggleOrg(e: MouseEvent) {
    e.stopPropagation();
    openOrg = !openOrg;
    if (openOrg) openProject = false;
  }
  function toggleProject(e: MouseEvent) {
    e.stopPropagation();
    openProject = !openProject;
    if (openProject) openOrg = false;
  }

  function selectOrg(org: z.infer<typeof OrgSchema>) {
    settingsProvider.setCurrentOrg(org.id);
    openOrg = false;
  }

  function selectProject(project: z.infer<typeof ProjectSchema>) {
    settingsProvider.setCurrentProject(project.id);
    openProject = false;
  }

  function onClickOutside(e: MouseEvent) {
    if (orgEl && !orgEl.contains(e.target as Node)) openOrg = false;
    if (projEl && !projEl.contains(e.target as Node)) openProject = false;
  }

  onMount(() => {
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  });

  function addCreatingProject() {
    creatingProjects.push({ id: String(Date.now()), name: "" });
    openProject = true;
  }

  async function confirmCreate(cp: { id: string; name: string }) {
    if (!currentOrg) return;

    const integration = IntegrationSchema.parse(
      await pb.collection("integrations").create({
        name: "Default Integration",
      })
    );
    const project = ProjectSchema.parse(
      await pb
        .collection("projects")
        .create({ name: cp.name, integrations: [integration.id] })
    );
    await pb
      .collection("orgs")
      .update(currentOrg.id, { "projects+": project.id });

    settingsProvider.setCurrentProject(project.id);
    settingsProvider.setCurrentIntegration(integration.id);
    await authProvider.refreshUser();

    creatingProjects = creatingProjects.filter((p) => p.id !== cp.id);
  }

  // Edit existing org
  function startEditOrg(e: MouseEvent, org: z.infer<typeof OrgSchema>) {
    e.stopPropagation();
    editingOrgId = org.id;
    editedOrgName = org.name;
    openOrg = true;
  }
  function cancelEditOrg(e: MouseEvent) {
    e.stopPropagation();
    editingOrgId = null;
    editedOrgName = "";
  }
  async function confirmEditOrg(e: MouseEvent, org: z.infer<typeof OrgSchema>) {
    e.stopPropagation();
    if (!editedOrgName.trim()) return;
    await pb.collection("orgs").update(org.id, { name: editedOrgName.trim() });
    settingsProvider.setCurrentOrg(org.id);
    await authProvider.refreshUser();
    editingOrgId = null;
    editedOrgName = "";
  }

  // Edit existing project
  function startEditProject(
    e: MouseEvent,
    project: z.infer<typeof ProjectSchema>
  ) {
    e.stopPropagation();
    editingProjectId = project.id;
    editedProjectName = project.name;
    openProject = true;
  }
  function cancelEditProject(e: MouseEvent) {
    e.stopPropagation();
    editingProjectId = null;
    editedProjectName = "";
  }
  async function confirmEditProject(
    e: MouseEvent,
    project: z.infer<typeof ProjectSchema>
  ) {
    e.stopPropagation();
    if (!editedProjectName.trim()) return;
    await pb
      .collection("projects")
      .update(project.id, { name: editedProjectName.trim() });
    settingsProvider.setCurrentProject(project.id);
    await authProvider.refreshUser();
    editingProjectId = null;
    editedProjectName = "";
  }

  // Delete project functionality
  function openDeleteProjectModal(
    e: MouseEvent,
    project: z.infer<typeof ProjectSchema>
  ) {
    e.stopPropagation();
    projectToDelete = project;
    showDeleteProjectModal = true;
  }
  function closeDeleteProjectModal() {
    showDeleteProjectModal = false;
    projectToDelete = null;
  }
  async function confirmDeleteProject() {
    if (!projectToDelete || !currentOrg) return;

    // Delete the project
    await pb.collection("projects").delete(projectToDelete.id);

    await authProvider.refreshUser();

    // If we deleted the current project, select the first available project
    if (currentProject?.id === projectToDelete.id) {
      const remainingProjects = projects.filter(
        (p) => p?.id !== projectToDelete?.id
      );
      if (remainingProjects.length > 0) {
        settingsProvider.setCurrentProject(remainingProjects[0]!.id);
      }
    }

    showDeleteProjectModal = false;
    projectToDelete = null;
  }
</script>

<div class="mb-6 space-y-1">
  <!-- Organization selector -->
  <div class="dropdown w-full" class:dropdown-open={openOrg} bind:this={orgEl}>
    <button class="btn btn-block justify-between truncate" onclick={toggleOrg}>
      ORG: {currentOrg?.name}
      <ChevronDown size={14} />
    </button>
    <ul
      class="dropdown-content menu bg-base-100 rounded-box shadow w-full mt-1 p-1"
    >
      {#each orgs as org (org?.id)}
        <li class="w-full">
          {#if editingOrgId === org?.id}
            <div class="flex items-center w-full gap-1 p-1">
              <input
                class="input input-bordered flex-[2]"
                bind:value={editedOrgName}
                onclick={(e) => e.stopPropagation()}
              />
              <button
                onclick={(e) => confirmEditOrg(e, org!)}
                class="btn btn-ghost btn-xs p-1"
              >
                <Check size={12} />
              </button>
              <button onclick={cancelEditOrg} class="btn btn-ghost btn-xs p-1">
                <X size={12} />
              </button>
            </div>
          {:else}
            <div class="flex items-center w-full gap-1 p-1">
              <button
                class:text-primary={org?.id === currentOrg?.id}
                class="flex-[2] text-left p-1 text-sm"
                onclick={() => selectOrg(org!)}
              >
                <span class="font-semibold">{org?.name}</span>
              </button>
              <button
                onclick={(e) => startEditOrg(e, org!)}
                class="btn btn-ghost btn-xs p-1"
              >
                <Edit size={12} />
              </button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </div>

  <!-- Project selector -->
  <div
    class="dropdown w-full"
    class:dropdown-open={openProject}
    bind:this={projEl}
  >
    <button
      class="btn btn-block justify-between truncate"
      onclick={toggleProject}
    >
      PROJECT: {currentProject?.name}
      <ChevronDown size={14} />
    </button>
    <ul
      class="dropdown-content menu bg-base-100 rounded-box shadow w-full mt-1 p-1"
    >
      <!-- existing projects -->
      {#each projects as project (project?.id)}
        <li class="w-full">
          {#if editingProjectId === project?.id}
            <div class="flex items-center w-full gap-1 p-1">
              <input
                class="input input-bordered flex-[2]"
                bind:value={editedProjectName}
                onclick={(e) => e.stopPropagation()}
              />
              <button
                onclick={(e) => confirmEditProject(e, project!)}
                class="btn btn-ghost btn-xs p-1"
              >
                <Check size={12} />
              </button>
              <button
                onclick={cancelEditProject}
                class="btn btn-ghost btn-xs p-1"
              >
                <X size={12} />
              </button>
            </div>
          {:else}
            <div class="flex items-center w-full gap-1 p-1">
              <button
                class:text-primary={project?.id === currentProject?.id}
                class="flex-[2] text-left p-1 text-sm"
                onclick={() => selectProject(project!)}
              >
                <span class="font-semibold">{project?.name}</span>
              </button>
              <button
                onclick={(e) => startEditProject(e, project!)}
                class="btn btn-ghost btn-xs p-1"
              >
                <Edit size={12} />
              </button>
              {#if projects.length > 1}
                <button
                  onclick={(e) => openDeleteProjectModal(e, project!)}
                  class="btn btn-ghost btn-xs p-1 text-error"
                  aria-label="Delete project"
                >
                  <Trash2 size={12} />
                </button>
              {/if}
            </div>
          {/if}
        </li>
      {/each}

      <!-- in-progress new project rows -->
      {#each creatingProjects as cp (cp.id)}
        <li class="w-full">
          <div class="flex items-center w-full gap-1 p-1">
            <input
              class="input input-bordered flex-[2]"
              type="text"
              placeholder="New name"
              bind:value={cp.name}
            />
            <button
              onclick={() => confirmCreate(cp)}
              class="btn btn-ghost btn-xs p-1"
            >
              <Check size={12} />
            </button>
          </div>
        </li>
      {/each}

      <li class="w-full">
        <button
          class="w-full text-left p-1 text-sm btn btn-primary btn-outline"
          onclick={addCreatingProject}
        >
          <span class="font-semibold">+ Create new</span>
        </button>
      </li>
    </ul>
  </div>
</div>

{#if showDeleteProjectModal}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
    style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 9999 !important;"
  >
    <div
      class="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col items-center"
    >
      <div class="text-lg font-semibold mb-4">Are you sure?</div>
      <div class="flex gap-2 w-full justify-center">
        <button class="btn btn-error btn-sm" onclick={confirmDeleteProject}
          >Yes, delete</button
        >
        <button class="btn btn-ghost btn-sm" onclick={closeDeleteProjectModal}
          >Cancel</button
        >
      </div>
    </div>
  </div>
{/if}
