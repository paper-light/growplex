<script lang="ts">
  import { authProvider } from "../auth/auth.svelte";
  import { pb } from "../../shared/pb";
  import { settingsProvider } from "../settings/settings.svelte";

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();

  const currentProject = $derived(settingsProvider.currentProject);
  const currentIntegration = $derived(settingsProvider.currentIntegration);

  let agentName = $state("");
  let systemInstruction = $state("");

  async function submitCreateAgent(e: Event) {
    e.preventDefault();
    if (!agentName || !currentProject || !currentIntegration) return;

    try {
      const newAgent = await pb.collection("agents").create({
        name: agentName,
        system: systemInstruction,
        provider: "openai",
      });

      await Promise.all([
        pb.collection("projects").update(currentProject.id, {
          "agents+": [newAgent.id],
        }),
        pb.collection("integrations").update(currentIntegration.id, {
          agent: newAgent.id,
        }),
      ]);

      agentName = "";
      systemInstruction = "";

      await authProvider.refreshUser();
      onClose();
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  }
</script>

<h3 class="font-bold text-lg mb-4">Create Agent</h3>

<form onsubmit={submitCreateAgent} class="space-y-4">
  <div class="form-control w-full">
    <label for="agentName" class="label">
      <span class="label-text">Name <span class="text-error">*</span></span>
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

  <div class="form-control w-full">
    <label for="systemInstruction" class="label">
      <span class="label-text">System Instruction</span>
    </label>
    <textarea
      id="systemInstruction"
      bind:value={systemInstruction}
      rows="4"
      class="textarea textarea-bordered w-full"
      placeholder="e.g. ‘You are a helpful assistant…’"
    ></textarea>
  </div>

  <button type="submit" class="btn btn-primary btn-block mt-2">
    Create Agent
  </button>
</form>
