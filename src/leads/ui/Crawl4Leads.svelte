<script lang="ts">
  import { actions } from "astro:actions";
  import { Rocket, Search } from "@lucide/svelte";

  import Button from "@/shared/ui/Button.svelte";
  import Modal from "@/shared/ui/Modal.svelte";
  import Input from "@/shared/ui/Input.svelte";
  import { projectsProvider } from "@/project/providers/projects.svelte";

  const project = $derived(projectsProvider.selectedProject);

  let loading = $state(false);

  let open = $state(false);
  let query = $state("");

  const disabled = $derived(!project || !query);

  async function crawlForLeads() {
    if (!project || !query) return;

    loading = true;
    open = false;

    const { error } = await actions.mineLeads({
      projectId: project.id,
      query,
    });

    if (error) {
      console.error(error);
    } else {
      query = "";
    }

    loading = false;
  }
</script>

<div class="flex items-center gap-2">
  <Button onclick={() => (open = true)}>
    Crawl for leads <Search class="size-4" />
  </Button>
</div>

<Modal backdrop bind:open>
  <div class="flex flex-col gap-4">
    <h2 class="text-lg font-bold">Crawl for leads</h2>
    <Input
      legend="Query"
      type="text"
      placeholder="Seafood restaurants in San Francisco"
      class="w-full"
      bind:value={query}
    >
      <Search class="size-4" />
    </Input>

    <Button onclick={crawlForLeads} {disabled}>
      Crawl <Rocket class="size-4" />
    </Button>
  </div>
</Modal>
