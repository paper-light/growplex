<script lang="ts">
    import z from "zod";
    import { onDestroy } from "svelte";
    import { slide } from "svelte/transition";
    import { X, Check, ChevronRight } from "@lucide/svelte";
    import { clickOutside } from "../shared/clickOutside";
  
    import { settingsProvider } from "../settings/settings.svelte";
    import { authProvider, pb } from "../auth/auth.svelte";
    import { IntegrationSchema } from "../../models";
  
    // Reactive state
    const currentOrg = $derived(settingsProvider.currentOrg)
    const currentProject = $derived(settingsProvider.currentProject);
    const currentIntegration = $derived(settingsProvider.currentIntegration);
    const integrations = $derived(
      authProvider.user?.expand?.orgMembers?.find(m => m.org === currentOrg?.id)?.expand?.org?.expand?.projects?.find(p => p.id === currentProject?.id)?.expand?.integrations || []
    );

    let open = $state(true);
    let sidebarEl: HTMLElement | null = $state(null);
  
    function openSidebar() {
      open = true;
    }
  
    function closeSidebar() {
      open = false;
    }
  
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") closeSidebar();
    }
  
    // add/remove Escape listener when `open` changes
    $effect(() => {
      if (open) {
        window.addEventListener("keydown", handleKeydown);
      } else {
        window.removeEventListener("keydown", handleKeydown);
      }
    });
  
    onDestroy(() => {
      window.removeEventListener("keydown", handleKeydown);
    });
  
    // Creation logic
    let creatingIntegrations = $state<{ id: string; name: string }[]>([]);
  
    function addCreatingIntegration() {
      creatingIntegrations.push({ id: String(Date.now()), name: "" });
    }
  
    async function confirmCreate(ci: { id: string; name: string }) {
      if (!currentProject) return;
  
      const newInt = IntegrationSchema.parse(
        await pb.collection("integrations").create({
          name: ci.name,
          project: currentProject.id
        })
      );
      await pb.collection("projects").update(currentProject.id, {
        "integrations+": newInt.id
      });
      await authProvider.refreshUser();
      creatingIntegrations = creatingIntegrations.filter(i => i.id !== ci.id);
      settingsProvider.setCurrentIntegration(newInt);
    }
  </script>
  
  {#if !open}
  <button
    type="button"
    class="absolute top-1/2 -left-8 -translate-y-1/2 rounded-full bg-primary hover:bg-base-200 transition border border-primary hover:text-primary z-40"
    aria-label="Open sidebar"
    onclick={openSidebar}
  >
    <ChevronRight size={32} />
  </button>
  {:else}
  <button
    type="button"
    class="absolute top-1/2 -left-8 -translate-y-1/2 rounded-full bg-primary hover:bg-base-200 transition border border-primary hover:text-primary z-40"
    aria-label="Open sidebar"
    onclick={closeSidebar}
  >
    <X size={32} />
  </button>
  {/if}
  
  {#if open}
    <aside
      bind:this={sidebarEl}
      use:clickOutside={closeSidebar}
      class="fixed top-0 left-0 lg:left-64 h-full lg:w-64 bg-base-200 shadow-xl px-4 pt-10 z-30"
      transition:slide={{axis: "x"}}
      aria-label="Integration sidebar"
      tabindex="-1"
      onintroend={() => sidebarEl?.focus()}
    >
      <!-- Close button -->
      <button
        type="button"
        class="btn btn-sm btn-ghost btn-circle absolute top-4 right-4"
        aria-label="Close sidebar"
        onclick={closeSidebar}
      >
        <X size={20} />
      </button>
  
      <!-- Integrations list -->
      <ul class="menu p-0 space-y-1 mb-4">
        {#each integrations as integration (integration.id)}
          <li>
            <button
              class="w-full text-left"
              class:text-primary={integration.id === currentIntegration?.id}
              onclick={() => settingsProvider.setCurrentIntegration(integration)}
            >
              {integration.name}
            </button>
          </li>
        {/each}
      </ul>
  
      <!-- Create Integration section -->
      <div class="mt-auto">
        {#each creatingIntegrations as ci (ci.id)}
          <div class="flex items-center gap-2 mb-2">
            <input
              class="input input-bordered flex-1"
              type="text"
              placeholder="New integration name"
              bind:value={ci.name}
            />
            <button onclick={() => confirmCreate(ci)} class="btn btn-ghost">
              <Check />
            </button>
          </div>
        {/each}
        <button
          class="btn btn-block btn-primary btn-outline"
          onclick={addCreatingIntegration}
        >
          + Create Integration
        </button>
      </div>
    </aside>
  {/if}
  