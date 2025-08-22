<script lang="ts">
  import { Funnel, Search } from "@lucide/svelte";
  import { SvelteSet } from "svelte/reactivity";

  import { leadsProvider } from "@/leads/providers/leads.svelte";
  import { projectsProvider } from "@/project/providers/projects.svelte";

  import Button from "@/shared/ui/Button.svelte";
  import Input from "@/shared/ui/Input.svelte";
  import Modal from "@/shared/ui/Modal.svelte";
  import LeadForm from "@/leads/ui/LeadForm.svelte";

  const LEAD_LEVELS = [
    { value: "cold", label: "Cold", color: "info" },
    { value: "warm", label: "Warm", color: "warning" },
    { value: "hot", label: "Hot", color: "error" },
    { value: "client", label: "Client", color: "success" },
  ];

  const project = $derived(projectsProvider.selectedProject);
  const leads = $derived(leadsProvider.leads);

  let search = $state("");
  let selectedLevels: SvelteSet<(typeof LEAD_LEVELS)[number]["value"]> = $state(
    new SvelteSet()
  );

  let selectedLeadId = $state("");
  const selectedLead = $derived(
    leads.find((lead) => lead.id === selectedLeadId) || null
  );

  const filteredLeads = $derived(
    leads.filter((lead) => {
      const textMatch =
        lead.name?.toLowerCase().includes(search.toLowerCase()) ||
        lead.description?.toLowerCase().includes(search.toLowerCase()) ||
        lead.email?.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(search.toLowerCase()) ||
        lead.id.toLowerCase().includes(search.toLowerCase());

      if (search.length > 0 && !textMatch) return false;
      if (selectedLevels.size > 0 && !selectedLevels.has(lead.level || ""))
        return false;

      return true;
    })
  );

  const sortedLeads = $derived(filteredLeads);

  function handleLeadClick(leadId: string) {
    selectedLeadId = leadId;
  }

  function toggleLevel(level: string) {
    if (selectedLevels.has(level)) {
      selectedLevels.delete(level);
    } else {
      selectedLevels.add(level);
    }
  }

  function clearFilters() {
    search = "";
    selectedLevels.clear();
  }
</script>

<div class="w-full h-full flex flex-col">
  <header class="px-4 py-2 border-b border-base-300 bg-base-100 space-y-2">
    <div class="flex items-center justify-between">
      <!-- FILTERS -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <Funnel class="size-4" />
          <h3 class="font-semibold">Filters</h3>
        </div>

        <div class="flex items-center gap-4 flex-wrap">
          <!-- Search Input -->
          <div class="relative">
            <Input
              color="neutral"
              bind:value={search}
              placeholder="Search leads..."
            >
              <Search class="size-4" />
            </Input>
          </div>

          <!-- Lead Levels Filter -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">Levels:</span>
            <div class="flex items-center gap-1">
              {#each LEAD_LEVELS as level}
                <Button
                  size="sm"
                  color={selectedLevels.has(level.value)
                    ? (level.color as any)
                    : "neutral"}
                  style="solid"
                  onclick={() => toggleLevel(level.value)}
                >
                  {level.label}
                </Button>
              {/each}
            </div>
          </div>

          <!-- Clear Filters -->
          {#if search || selectedLevels.size > 0}
            <Button onclick={clearFilters} color="neutral" size="sm">
              Clear
            </Button>
          {/if}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button>
          Crawl for leads <Search class="size-4" />
        </Button>
      </div>
    </div>
  </header>

  <main class="flex-1 flex flex-col min-h-0 p-4">
    <div class="flex flex-col gap-4 flex-1 min-h-0">
      {#if leads.length > 0}
        <div class="overflow-x-auto flex-1">
          <table class="table w-full">
            <thead class="sticky top-0 bg-base-100 z-10">
              <tr>
                <th class="w-64">Name</th>
                <th class="w-48">Level</th>
                <th class="w-48">Email</th>
                <th class="w-48">Phone</th>
                <th class="w-1/3">Description</th>
                <th class="w-32">Created</th>
                <th class="w-24">Actions</th>
              </tr>
            </thead>

            <tbody>
              {#each sortedLeads as lead}
                <tr
                  onclick={() => handleLeadClick(lead.id)}
                  class={[
                    "hover cursor-pointer hover:bg-base-200 rounded-lg transition",
                    lead.id === selectedLead?.id &&
                      "bg-primary/20 hover:bg-primary/40",
                  ]}
                >
                  <td class="font-medium">
                    {lead.name || `Lead ${lead.id?.slice(0, 4) || "N/A"}`}
                  </td>
                  <td>
                    {#if lead.level}
                      <span
                        class={[
                          "badge badge-sm",
                          `badge-${LEAD_LEVELS.find((l) => l.value === lead.level)?.color || "neutral"}`,
                        ]}
                      >
                        {LEAD_LEVELS.find((l) => l.value === lead.level)
                          ?.label || lead.level}
                      </span>
                    {:else}
                      <span class="text-base-content/50 text-sm">-</span>
                    {/if}
                  </td>
                  <td>
                    {#if lead.email}
                      <a
                        href="mailto:{lead.email}"
                        class="text-primary hover:underline"
                      >
                        {lead.email}
                      </a>
                    {:else}
                      <span class="text-base-content/50 text-sm">-</span>
                    {/if}
                  </td>
                  <td>
                    {#if lead.phone}
                      <a
                        href="tel:{lead.phone}"
                        class="text-primary hover:underline"
                      >
                        {lead.phone}
                      </a>
                    {:else}
                      <span class="text-base-content/50 text-sm">-</span>
                    {/if}
                  </td>
                  <td>
                    {#if lead.description}
                      <p class="text-sm line-clamp-2">
                        {lead.description}
                      </p>
                    {:else}
                      <span class="text-base-content/50 text-sm">-</span>
                    {/if}
                  </td>
                  <td>
                    {#if lead.created}
                      <span class="text-sm text-base-content/70">
                        {new Date(lead.created).toLocaleDateString()}
                      </span>
                    {:else}
                      <span class="text-base-content/50 text-sm">-</span>
                    {/if}
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <!-- ACTIONS -->
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div class="flex flex-col gap-2 p-4 text-center">
          <h2 class="text-lg font-bold">No leads found</h2>
          <p class="text-base-content/70">
            {search || selectedLevels.size > 0
              ? "Try adjusting your filters"
              : "Create your first lead to get started"}
          </p>
        </div>
      {/if}
    </div>
  </main>
</div>

<Modal
  class="w-full max-w-xl h-full"
  open={!!selectedLead}
  placement="left"
  onclose={() => (selectedLeadId = "")}
  backdrop
>
  <LeadForm lead={selectedLead} onSuccess={() => (selectedLeadId = "")} />
</Modal>
