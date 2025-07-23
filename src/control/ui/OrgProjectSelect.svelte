<script lang="ts">
  import { ChevronDown, Check, Edit, X, Trash2 } from "@lucide/svelte";

  import { clickOutside } from "../../shared/actions/click-outside";
  import { settingsProvider } from "../../user/settings.svelte";
  import { userProvider } from "../../user/user.svelte";
  import { projectsProvider } from "../providers/projects.svelte";
  import { orgCrud } from "../repositories/org-crud";
  import { projectCrud } from "../repositories/project-crud";
  import { pb } from "../../shared/lib/pb";

  const currentOrg = $derived(userProvider.selectedOrg);
  const currentProject = $derived(projectsProvider.selectedProject);

  const orgs = $derived(userProvider.orgs);
  const projects = $derived(projectsProvider.projects);

  let openOrg = $state(false);
  let openProject = $state(false);

  let creatingProjects = $state<{ id: string; name: string }[]>([]);

  // Editing state
  let editingOrgId = $state<string | null>(null);
  let editingProjectId = $state<string | null>(null);
  let editedOrgName = $state<string>("");
  let editedProjectName = $state<string>("");

  let showDeleteProjectModal = $state(false);
  let projectToDeleteId = $state<string | null>(null);

  const editingOrg = $derived(
    editingOrgId ? orgs.find((o) => o?.id === editingOrgId) : null
  );
  const editingProject = $derived(
    editingProjectId ? projects.find((p) => p?.id === editingProjectId) : null
  );

  function selectOrg(orgId: string) {
    settingsProvider.selectOrg(orgId);
    openOrg = false;
  }

  function selectProject(projectId: string) {
    settingsProvider.selectProject(projectId);
    openProject = false;
  }

  function addCreatingProject() {
    creatingProjects.push({ id: String(Date.now()), name: "" });
    openProject = true;
  }

  async function confirmCreate(cp: { id: string; name: string }) {
    if (!currentOrg) return;

    const project = await projectCrud.create({
      org: currentOrg.id,
      name: cp.name,
    });
    const integration = await pb
      .collection("integrations")
      .getFirstListItem(`project = "${project.id}"`);

    settingsProvider.selectProject(project.id);
    settingsProvider.selectIntegration(integration.id);

    creatingProjects = creatingProjects.filter((p) => p.id !== cp.id);
  }

  // Edit existing org
  function startEditOrg(e: MouseEvent, orgId: string) {
    e.stopPropagation();
    editingOrgId = orgId;
    editedOrgName = editingOrg?.name || "";
    openOrg = true;
  }
  function cancelEditOrg(e: MouseEvent) {
    e.stopPropagation();
    editingOrgId = null;
    editedOrgName = "";
  }
  async function confirmEditOrg(e: MouseEvent, orgId: string) {
    e.stopPropagation();
    if (!editedOrgName.trim()) return;
    const newOrg = await orgCrud.update({
      id: orgId,
      name: editedOrgName.trim(),
    });
    userProvider.orgs = userProvider.orgs.map((o) =>
      o.id === orgId ? newOrg : o
    );
    settingsProvider.selectOrg(orgId);
    editingOrgId = null;
    editedOrgName = "";
  }

  // Edit existing project
  function startEditProject(e: MouseEvent, projectId: string) {
    e.stopPropagation();
    editingProjectId = projectId;
    editedProjectName = editingProject?.name || "";
    openProject = true;
  }
  function cancelEditProject(e: MouseEvent) {
    e.stopPropagation();
    editingProjectId = null;
    editedProjectName = "";
  }
  async function confirmEditProject(e: MouseEvent, projectId: string) {
    e.stopPropagation();
    if (!editedProjectName.trim()) return;
    await projectCrud.update({
      id: projectId,
      name: editedProjectName.trim(),
    });
    settingsProvider.selectProject(projectId);
    editingProjectId = null;
    editedProjectName = "";
  }

  // Delete project functionality
  function openDeleteProjectModal(e: MouseEvent, projectId: string) {
    e.stopPropagation();
    projectToDeleteId = projectId;
    showDeleteProjectModal = true;
  }
  function closeDeleteProjectModal() {
    showDeleteProjectModal = false;
    projectToDeleteId = null;
  }
  async function confirmDeleteProject() {
    if (!projectToDeleteId) return;

    // Delete the project
    await projectCrud.delete(projectToDeleteId);

    // If we deleted the current project, select the first available project
    if (currentProject?.id === projectToDeleteId) {
      const remainingProjects = projects.filter(
        (p) => p?.id !== projectToDeleteId
      );
      if (remainingProjects.length > 0) {
        settingsProvider.selectProject(remainingProjects[0]!.id);
      }
    }

    showDeleteProjectModal = false;
    projectToDeleteId = null;
  }
</script>

<div class="mb-4 space-y-2">
  <!-- Organization selector -->
  <details
    bind:open={openOrg}
    class="dropdown w-full"
    use:clickOutside={{
      callback: () => (openOrg = false),
    }}
  >
    <summary
      class="btn btn-block btn-sm btn-ghost justify-between truncate relative"
    >
      <span class="absolute left-0 -top-1 text-info">
        <span class="text-xs">org</span>
      </span>
      <span class="font-semibold">{currentOrg?.name}</span>
      <ChevronDown size={14} />
    </summary>
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
                onclick={(e) => confirmEditOrg(e, org?.id)}
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
                onclick={() => selectOrg(org.id)}
              >
                <span class="font-semibold">{org?.name}</span>
              </button>
              <button
                onclick={(e) => startEditOrg(e, org.id)}
                class="btn btn-ghost btn-xs p-1"
              >
                <Edit size={12} />
              </button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </details>

  <!-- Project selector -->
  <details
    bind:open={openProject}
    class="dropdown w-full"
    use:clickOutside={{ callback: () => (openProject = false) }}
  >
    <summary class="btn btn-block justify-between truncate btn-sm btn-ghost">
      <span class="absolute left-0 -top-1 text-info">
        <span class="text-xs text-light">project</span>
      </span>
      <span class="font-semibold">{currentProject?.name}</span>
      <ChevronDown size={14} />
    </summary>
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
                onclick={(e) => confirmEditProject(e, project?.id)}
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
                onclick={() => selectProject(project?.id)}
              >
                <span class="font-semibold">{project?.name}</span>
              </button>
              <button
                onclick={(e) => startEditProject(e, project?.id)}
                class="btn btn-ghost btn-xs p-1"
              >
                <Edit size={12} />
              </button>
              {#if projects.length > 1}
                <button
                  onclick={(e) => openDeleteProjectModal(e, project?.id)}
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
            <button
              onclick={() =>
                (creatingProjects = creatingProjects.filter(
                  (p) => p.id !== cp.id
                ))}
              class="btn btn-ghost btn-xs p-1"
              aria-label="Cancel new project"
            >
              <X size={12} />
            </button>
          </div>
        </li>
      {/each}

      <li class="w-full">
        <button
          class="w-full text-left p-1 text-sm btn btn-primary btn-outline btn-sm"
          onclick={addCreatingProject}
        >
          <span class="font-semibold">+ Create new</span>
        </button>
      </li>
    </ul>
  </details>
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
