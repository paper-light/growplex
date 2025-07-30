<script lang="ts">
  import { Trash2, X } from "@lucide/svelte";

  import Thalia from "@/shared/assets/thalia.jpg";
  import Input from "@/shared/ui/lib/Input.svelte";
  import { agentsProvider } from "@/agent/providers/agents.svelte";
  import Select from "@/shared/ui/lib/Select.svelte";
  import { integrationsProvider } from "@/integration/providers/integrations.svelte";
  import Card from "@/shared/ui/lib/Card.svelte";
  import Modal from "@/shared/ui/lib/Modal.svelte";
  import TextArea from "@/shared/ui/lib/TextArea.svelte";
  import { agentCrud } from "@/agent/repositories/agent-crud";
  import { pb } from "@/shared/lib/pb";
  import Button from "@/shared/ui/lib/Button.svelte";
  import { projectsProvider } from "@/control/providers/projects.svelte";
  import AgentCreate from "@/agent/ui/features/AgentCreate.svelte";
  import AgentAvatarUpdate from "@/agent/ui/features/AgentAvatarUpdate.svelte";

  let filterIntegrationId = $state("");
  let filterName = $state("");
  let editAgentId = $state("");

  let deleteAgentId = $state("");

  const deleteAgentOpen = $derived(deleteAgentId !== "");
  const editAgentOpen = $derived(editAgentId !== "");

  const project = $derived(projectsProvider.selectedProject);
  const integrations = $derived(integrationsProvider.integrations);
  const filterIntegartion = $derived(
    filterIntegrationId
      ? integrations.find((i) => i.id === filterIntegrationId)
      : null
  );
  const agents = $derived(agentsProvider.agents);
  const filteredAgents = $derived.by(() => {
    let result = agents;
    if (filterIntegartion) {
      result = result.filter((a) => filterIntegartion.agents.includes(a.id));
    }
    if (filterName) {
      result = result.filter(
        (a) => a.name.includes(filterName) || a.id.includes(filterName)
      );
    }
    return result;
  });

  const editAgent = $derived(
    editAgentId ? agents.find((a) => a.id === editAgentId) : null
  );

  function editAgentEnd() {
    editAgentId = "";
  }
</script>

<div class="px-4 py-2 space-y-4">
  <div>
    <h2 class="font-semibold">Filters</h2>

    <div class="flex gap-2 items-center flex-wrap">
      <Input
        color="neutral"
        bind:value={filterName}
        placeholder="Search Agents"
      />

      <Select
        class="w-fit max-w-64"
        bind:value={filterIntegrationId}
        color="neutral"
        options={integrations.map((i) => ({ label: i.name, value: i.id }))}
      >
        All integrations
      </Select>

      {#if filterName || filterIntegrationId}
        <Button
          onclick={() => {
            filterName = "";
            filterIntegrationId = "";
          }}
          color="neutral"
          style="outline">Clear</Button
        >
      {/if}

      <AgentCreate
        projectId={project?.id || ""}
        afterCreate={(agent) => {
          editAgentId = agent.id;
        }}
      />
    </div>
  </div>

  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    {#each filteredAgents as agent}
      <button class="h-full" onclick={() => (editAgentId = agent.id)}>
        <Card
          class="h-full p-3 hover:bg-base-300 transition cursor-pointer flex flex-col"
          image={{
            styles: "size-36 rounded-3xl",
            src: pb.files.getURL(agent, agent.avatar) || Thalia.src,
            alt: agent.name,
            mode: "side",
          }}
          title={agent.name}
        >
          <p class="text-sm text-base-content/50 flex-1 overflow-hidden">
            <span class="block overflow-hidden text-ellipsis whitespace-nowrap">
              {agent.system}
            </span>
          </p>
        </Card>
      </button>
    {/each}
  </div>
</div>

<Modal onclose={editAgentEnd} open={editAgentOpen}>
  <form
    onsubmit={async (e) => {
      if (!editAgent) return;
      e.preventDefault();

      const inputAvatar = (e.currentTarget as any).avatar.files?.[0] || null;
      const inputName = (e.currentTarget as any).name.value;
      const inputSystem = (e.currentTarget as any).system.value;

      console.log(inputAvatar, inputName, inputSystem);

      await agentCrud.update({
        id: editAgent.id,
        avatar: inputAvatar,
        name: inputName,
        system: inputSystem,
      });

      editAgentEnd();
    }}
  >
    <div class="flex gap-4">
      <AgentAvatarUpdate mode="form" agent={editAgent} />

      <div class="flex-1 space-y-4">
        <Input
          color="neutral"
          name="name"
          value={editAgent?.name || ""}
          placeholder="Name"
        >
          Name
        </Input>

        <TextArea
          color="neutral"
          name="system"
          value={editAgent?.system || ""}
          placeholder="System Instructions"
        >
          System Instructions
        </TextArea>
      </div>
    </div>

    <div class="flex justify-end gap-1 mt-4">
      <Button type="submit" color="primary" style="outline">Save</Button>

      <Button
        type="button"
        color="neutral"
        style="outline"
        onclick={editAgentEnd}>Cancel</Button
      >

      <Button
        type="button"
        color="error"
        style="outline"
        onclick={() => {
          deleteAgentId = editAgent?.id || "";
        }}>Delete</Button
      >
    </div>
  </form>
</Modal>

<Modal onclose={() => (deleteAgentId = "")} open={deleteAgentOpen}>
  <div class="flex flex-col gap-2">
    <h2 class="font-semibold">Delete Agent</h2>
    <p>Are you sure you want to delete this agent?</p>

    <Button
      color="neutral"
      style="outline"
      onclick={() => (deleteAgentId = "")}
    >
      Cancel <X size={16} />
    </Button>

    <Button
      color="error"
      style="outline"
      onclick={() => {
        if (!deleteAgentId) return;
        agentCrud.delete(deleteAgentId);
        deleteAgentId = "";
        editAgentEnd();
      }}
    >
      Delete <Trash2 size={16} />
    </Button>
  </div>
</Modal>
