<script lang="ts">
  import { authProvider } from "../auth/auth.svelte";
  import { pb } from "../../shared/lib/pb";
  import type { AgentsResponse } from "../../shared/models/pocketbase-types";
  interface Props {
    entity: AgentsResponse;
    onClose: () => void;
  }

  let { entity, onClose }: Props = $props();

  let agentName = $state(entity?.name ?? "");
  let systemInstruction = $state(entity?.system ?? "");
  let provider = $state<"openai" | "anthropic" | "deepseek" | "google">(
    (entity?.provider as any) ?? "openai"
  );

  async function submitEditAgent(e: Event) {
    e.preventDefault();
    if (!agentName) return;

    try {
      await pb.collection("agents").update(entity.id, {
        name: agentName,
        system: systemInstruction,
        provider,
      });

      await authProvider.refreshUser();
      onClose();
    } catch (error) {
      console.error("Error updating agent:", error);
    }
  }
</script>

<h3 class="font-bold text-lg mb-4">Edit Agent</h3>

<form onsubmit={submitEditAgent} class="space-y-4">
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
      placeholder="e.g. 'You are a helpful assistant…'"
    ></textarea>
  </div>

  <!-- <div class="form-control w-full">
    <label for="provider" class="label">
      <span class="label-text">Provider</span>
    </label>
    <select
      id="provider"
      bind:value={provider}
      class="select select-bordered w-full"
    >
      <option value="openai">OpenAI</option>
      <option value="anthropic">Anthropic</option>
      <option value="deepseek">DeepSeek</option>
      <option value="google">Google</option>
    </select>
  </div> -->

  <button type="submit" class="btn btn-primary btn-block mt-2">
    Save Changes
  </button>
</form>
