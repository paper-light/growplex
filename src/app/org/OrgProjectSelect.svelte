<script lang="ts">
  import z from "zod";
  import { onMount } from "svelte";
  import { ChevronDown, Check } from "@lucide/svelte";

  import { ProjectSchema, type OrgSchema } from "../../models";

  import { settingsProvider } from "../settings/settings.svelte";
  import { authProvider, pb } from "../auth/auth.svelte";

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
    settingsProvider.setCurrentOrg(org);
    openOrg = false;
  }

  function selectProject(project: z.infer<typeof ProjectSchema>) {
    settingsProvider.setCurrentProject(project);
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

    const project = ProjectSchema.parse(
      await pb.collection("projects").create({ name: cp.name })
    );
    await pb
      .collection("orgs")
      .update(currentOrg.id, { "projects+": project.id });
    await authProvider.refreshUser();

    creatingProjects = creatingProjects.filter((p) => p.id !== cp.id);
    settingsProvider.setCurrentProject(project);
  }
</script>

<div class="mb-6 space-y-1">
  <!-- Organization selector -->
  <div class="dropdown w-full" class:dropdown-open={openOrg} bind:this={orgEl}>
    <button class="btn btn-block justify-between" onclick={toggleOrg}>
      ORG: {currentOrg?.name}
      <ChevronDown size={14} />
    </button>
    <ul
      class="dropdown-content menu bg-base-100 rounded-box shadow w-full mt-2 p-2"
    >
      {#each orgs as org (org?.id)}
        <li>
          <button
            class:text-primary={org?.id === currentOrg?.id}
            class="w-full text-left"
            onclick={() => selectOrg(org!)}
          >
            <span class="font-semibold">{org?.name}</span>
          </button>
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
    <button class="btn btn-block justify-between" onclick={toggleProject}>
      PROJECT: {currentProject?.name}
      <ChevronDown size={14} />
    </button>
    <ul
      class="dropdown-content menu bg-base-100 rounded-box shadow w-full mt-2 p-2"
    >
      <!-- existing projects -->
      {#each projects as project (project?.id)}
        <li>
          <button
            class:text-primary={project?.id === currentProject?.id}
            class="w-full text-left p-2"
            onclick={() => selectProject(project)}
          >
            <span class="font-semibold">{project?.name}</span>
          </button>
        </li>
      {/each}

      <!-- in-progress new project rows -->
      {#each creatingProjects as cp (cp.id)}
        <li class="w-full">
          <div class="flex items-center gap-2 p-2">
            <input
              class="input input-bordered flex-1"
              type="text"
              placeholder="New name"
              bind:value={cp.name}
            />
            <button onclick={() => confirmCreate(cp)} class="btn btn-ghost">
              <Check />
            </button>
          </div>
        </li>
      {/each}

      <li>
        <button
          class="w-full text-left p-2 btn btn-primary btn-outline"
          onclick={addCreatingProject}
        >
          <span class="font-semibold">+ Create new</span>
        </button>
      </li>
    </ul>
  </div>
</div>
