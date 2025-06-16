<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { X, ChevronLeft } from "@lucide/svelte";
  import { onDestroy } from "svelte";

  import { clickOutside } from "../shared/clickOutside";

  // reactive state
  let open = $state(false);
  let sidebarEl: HTMLElement;

  function openSidebar() {
    open = true;
  }

  function closeSidebar() {
    open = false;
  }

  // close on Escape
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") closeSidebar();
  }

  // add/remove Escape listener whenever `open` changes
  $effect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeydown);
    } else {
      window.removeEventListener("keydown", handleKeydown);
    }
  });

  // ensure cleanup on unmount
  onDestroy(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
</script>

<!-- Open button -->
<button
  type="button"
  class="fixed top-1/2 right-0 -translate-y-1/2 rounded-full border"
  aria-label="Open sidebar"
  onclick={openSidebar}
>
  <ChevronLeft size={32} />
</button>

{#if open}
  <aside
    bind:this={sidebarEl}
    use:clickOutside={closeSidebar}
    class="fixed top-0 right-0 h-full w-80 bg-base-200 shadow-xl p-6 z-30"
    transition:slide={{ duration: 300, axis: "x" }}
    aria-label="Sidebar"
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

    <!-- Sidebar content -->
    <h1>Content</h1>
  </aside>
{/if}
