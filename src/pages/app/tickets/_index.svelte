<script lang="ts">
  import { Funnel, Search, Plus } from "@lucide/svelte";
  import { SvelteSet } from "svelte/reactivity";

  import { ticketsProvider } from "@/ticket/providers/tickets.svelte";
  import { projectsProvider } from "@/project/providers/projects.svelte";

  import Button from "@/shared/ui/Button.svelte";
  import Input from "@/shared/ui/Input.svelte";
  import Modal from "@/shared/ui/Modal.svelte";
  import TicketForm from "@/ticket/ui/TicketForm.svelte";

  const TICKET_TYPES = [
    { value: "feedback", label: "Feedback", color: "info" },
    { value: "support", label: "Support", color: "warning" },
    { value: "ai", label: "Generated", color: "primary" },
  ];

  const TICKET_PRIORITIES = [
    { value: "low", label: "Low", color: "info" },
    { value: "medium", label: "Medium", color: "warning" },
    { value: "high", label: "High", color: "error" },
  ];

  const project = $derived(projectsProvider.selectedProject);
  const tickets = $derived(ticketsProvider.tickets);

  let search = $state("");
  let selectedType = $state("ai");
  let selectedPriorities: SvelteSet<
    (typeof TICKET_PRIORITIES)[number]["value"]
  > = $state(new SvelteSet());
  let showDone = $state(false);

  let selectedTicketId = $state("");
  const selectedTicket = $derived(
    tickets.find((ticket) => ticket.id === selectedTicketId) || null
  );

  const filteredTickets = $derived(
    tickets.filter((ticket) => {
      const textMatch =
        ticket.title?.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(search.toLowerCase()) ||
        ticket.id.toLowerCase().includes(search.toLowerCase());

      if (search.length > 0 && !textMatch) return false;
      if (selectedType && ticket.type !== selectedType) return false;
      if (
        selectedPriorities.size > 0 &&
        !selectedPriorities.has(ticket.priority || "")
      )
        return false;
      if (!showDone && ticket.done) return false;

      return true;
    })
  );
  const sortedTickets = $derived(filteredTickets);

  function togglePriority(priority: string) {
    if (selectedPriorities.has(priority)) {
      selectedPriorities.delete(priority);
    } else {
      selectedPriorities.add(priority);
    }
  }

  function clearFilters() {
    search = "";
    selectedType = "ai";
    selectedPriorities.clear();
    showDone = false;
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
              placeholder="Search tickets..."
            >
              <Search class="size-4" />
            </Input>
          </div>

          <!-- Ticket Type Filter -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">Type:</span>
            <div class="flex items-center gap-1">
              {#each TICKET_TYPES as type}
                <Button
                  size="sm"
                  color={selectedType === type.value
                    ? (type.color as any)
                    : "neutral"}
                  style="solid"
                  onclick={() => (selectedType = type.value)}
                >
                  {type.label}
                </Button>
              {/each}
            </div>
          </div>

          <!-- Priority Filter -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">Priority:</span>
            <div class="flex items-center gap-1">
              {#each TICKET_PRIORITIES as priority}
                <Button
                  size="sm"
                  color={selectedPriorities.has(priority.value)
                    ? (priority.color as any)
                    : "neutral"}
                  style="solid"
                  onclick={() => togglePriority(priority.value)}
                >
                  {priority.label}
                </Button>
              {/each}
            </div>
          </div>

          <!-- Done Toggle -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">Show Done:</span>
            <input
              type="checkbox"
              class="toggle toggle-sm"
              bind:checked={showDone}
            />
          </div>

          <!-- Clear Filters -->
          {#if search || selectedType !== "ai" || selectedPriorities.size > 0 || showDone}
            <Button onclick={clearFilters} color="neutral" size="sm">
              Clear
            </Button>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main class="flex-1 flex flex-col min-h-0 p-4">
    <div class="flex flex-col gap-4 flex-1 min-h-0">
      {#if tickets.length > 0}
        <div class="overflow-x-auto flex-1">
          <table class="table w-full">
            <thead class="sticky top-0 bg-base-100 z-10">
              <tr>
                <th class="w-64">Title</th>
                <th class="w-32">Type</th>
                <th class="w-32">Priority</th>
                <th class="w-32">Status</th>
                <th class="w-1/3">Description</th>
                <th class="w-32">Created</th>
                <th class="w-24">Actions</th>
              </tr>
            </thead>

            <tbody>
              {#each sortedTickets as ticket}
                <tr
                  onclick={() => (selectedTicketId = ticket.id)}
                  class={[
                    "hover cursor-pointer hover:bg-base-200 rounded-lg transition",
                    ticket.id === selectedTicket?.id &&
                      "bg-primary/20 hover:bg-primary/40",
                  ]}
                >
                  <td class="font-medium">
                    {ticket.title ||
                      `Ticket ${ticket.id?.slice(0, 4) || "N/A"}`}
                  </td>
                  <td>
                    {#if ticket.type}
                      <span
                        class={[
                          "badge badge-sm",
                          `badge-${TICKET_TYPES.find((t) => t.value === ticket.type)?.color || "neutral"}`,
                        ]}
                      >
                        {TICKET_TYPES.find((t) => t.value === ticket.type)
                          ?.label || ticket.type}
                      </span>
                    {:else}
                      <span class="text-base-content/50 text-sm">-</span>
                    {/if}
                  </td>
                  <td>
                    {#if ticket.priority}
                      <span
                        class={[
                          "badge badge-sm",
                          `badge-${TICKET_PRIORITIES.find((p) => p.value === ticket.priority)?.color || "neutral"}`,
                        ]}
                      >
                        {TICKET_PRIORITIES.find(
                          (p) => p.value === ticket.priority
                        )?.label || ticket.priority}
                      </span>
                    {:else}
                      <span class="text-base-content/50 text-sm">-</span>
                    {/if}
                  </td>
                  <td>
                    <span
                      class={[
                        "badge badge-sm",
                        ticket.done ? "badge-success" : "badge-warning",
                      ]}
                    >
                      {ticket.done ? "Done" : "Open"}
                    </span>
                  </td>
                  <td>
                    {#if ticket.description}
                      <p class="text-sm line-clamp-2">
                        {ticket.description}
                      </p>
                    {:else}
                      <span class="text-base-content/50 text-sm">-</span>
                    {/if}
                  </td>
                  <td>
                    {#if ticket.created}
                      <span class="text-sm text-base-content/70">
                        {new Date(ticket.created).toLocaleDateString()}
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
          <h2 class="text-lg font-bold">No tickets found</h2>
          <p class="text-base-content/70">
            {search ||
            selectedType !== "ai" ||
            selectedPriorities.size > 0 ||
            showDone
              ? "Try adjusting your filters"
              : "Your tickets will appear here"}
          </p>
        </div>
      {/if}
    </div>
  </main>
</div>

<Modal
  class="w-full max-w-xl h-screen overflow-hidden"
  open={!!selectedTicket}
  placement="left"
  onclose={() => (selectedTicketId = "")}
  backdrop
>
  <TicketForm
    ticket={selectedTicket}
    onSuccess={() => (selectedTicketId = "")}
    onChatNavigate={() => (selectedTicketId = "")}
  />
</Modal>
