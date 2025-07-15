<script lang="ts">
  import { onMount } from "svelte";
  import { settingsProvider } from "../app/settings/settings.svelte";
  import { authProvider } from "../app/auth/auth.svelte";
  import { pb } from "../shared/lib/pb";
  import AvatarInput from "../shared/ui/components/AvatarInput.svelte";

  import AgentSelect from "./AgentSelect.svelte";
  import AgentCreate from "./AgentCreate.svelte";

  const currentAgent = $derived(settingsProvider.currentAgent);
  const allAgents = $derived(
    settingsProvider.currentProject?.expand?.agents || []
  );

  let agentName = $derived(currentAgent?.name ?? "");
  let systemInstruction = $derived(currentAgent?.system ?? "");
  let agentAvatar: File | null = $state(null);
  let agentUpdateTimer: NodeJS.Timeout | null = $state(null);

  function debouncedAgentUpdate() {
    if (agentUpdateTimer) {
      clearTimeout(agentUpdateTimer);
    }
    agentUpdateTimer = setTimeout(async () => {
      if (!currentAgent) return;

      try {
        const formData = new FormData();
        let hasChanges = false;

        if (agentName !== currentAgent.name) {
          formData.append("name", agentName);
          hasChanges = true;
        }
        if (systemInstruction !== currentAgent.system) {
          formData.append("system", systemInstruction);
          hasChanges = true;
        }
        if (agentAvatar) {
          formData.append("avatar", agentAvatar);
          hasChanges = true;
        }

        if (hasChanges) {
          await pb.collection("agents").update(currentAgent.id, formData);
          await authProvider.refreshUser();
          agentAvatar = null; // Reset after upload
        }
      } catch (error) {
        console.error("Error updating agent:", error);
      }
    }, 500);
  }

  function handleAvatarChange(file: File) {
    agentAvatar = file;
    debouncedAgentUpdate();
  }

  $effect(() => {
    if (
      agentName !== currentAgent?.name ||
      systemInstruction !== currentAgent?.system
    ) {
      debouncedAgentUpdate();
    }
  });

  onMount(() => {
    return () => {
      if (agentUpdateTimer) clearTimeout(agentUpdateTimer);
    };
  });
</script>

{#if !currentAgent}
  <div class="flex flex-col items-center justify-center gap-6 py-16">
    <div class="w-full max-w-xl flex flex-col gap-4">
      <AgentCreate size="lg" />
      {#if allAgents.length > 0}
        <AgentSelect size="lg" />
      {/if}
    </div>
  </div>
{:else}
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex gap-6">
        <!-- Avatar Section -->
        <AvatarInput
          avatar={currentAgent?.avatar
            ? pb.files.getURL(currentAgent, currentAgent.avatar)
            : null}
          size="md"
          onChange={handleAvatarChange}
        />

        <!-- Form Fields -->
        <div class="flex-1 space-y-4">
          <!-- Name -->
          <div class="form-control w-full">
            <label for="agentName" class="label">
              <span class="label-text font-medium"
                >Title <span class="text-error">*</span></span
              >
            </label>
            <input
              id="agentName"
              type="text"
              bind:value={agentName}
              required
              class="input input-bordered w-full"
              placeholder="Agent name"
            />
          </div>

          <!-- System Instruction -->
          <div class="form-control w-full">
            <label for="systemInstruction" class="label">
              <span class="label-text font-medium">Text</span>
            </label>
            <textarea
              id="systemInstruction"
              bind:value={systemInstruction}
              rows="4"
              class="textarea textarea-bordered w-full resize-none"
              placeholder="e.g. 'You are a helpful assistant…'"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
