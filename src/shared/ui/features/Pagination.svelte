<script lang="ts">
  import { ChevronLeft, ChevronRight } from "@lucide/svelte";

  interface Props {
    page: number;
    totalPages: number;
    itemsLength: number;
    onPageChange?: (page: number) => void;
  }

  let {
    page = $bindable(1),
    totalPages,
    itemsLength,
    onPageChange,
  }: Props = $props();

  function goToPreviousPage() {
    if (page > 1) {
      page--;
      onPageChange?.(page);
    }
  }

  function goToNextPage() {
    if (page < totalPages) {
      page++;
      onPageChange?.(page);
    }
  }

  function goToPage(targetPage: number) {
    if (targetPage >= 1 && targetPage <= totalPages) {
      page = targetPage;
      onPageChange?.(page);
    }
  }
</script>

<!-- Pagination Controls -->
{#if totalPages > 1}
  <div
    class="flex items-center justify-center p-4 border-t border-base-300 bg-base-50"
  >
    <div class="flex items-center gap-4">
      <!-- Join Group Pagination -->
      <div class="join">
        <!-- Previous Page -->
        <button
          class="join-item btn btn-sm"
          onclick={goToPreviousPage}
          disabled={page <= 1}
        >
          <ChevronLeft class="size-4" />
        </button>

        <!-- First Page -->
        {#if page > 1}
          <button class="join-item btn btn-sm" onclick={() => goToPage(1)}>
            1
          </button>
        {/if}

        <!-- Ellipsis after first page -->
        {#if page > 3}
          <button class="join-item btn btn-sm" disabled>...</button>
        {/if}

        <!-- Previous page number -->
        {#if page > 2 && page - 1 > 1}
          <button
            class="join-item btn btn-sm"
            onclick={() => goToPage(page - 1)}
          >
            {page - 1}
          </button>
        {/if}

        <!-- Current Page -->
        <button class="join-item btn btn-sm btn-primary">
          {page}
        </button>

        <!-- Next page number -->
        {#if page < totalPages - 1 && page + 1 < totalPages}
          <button
            class="join-item btn btn-sm"
            onclick={() => goToPage(page + 1)}
          >
            {page + 1}
          </button>
        {/if}

        <!-- Ellipsis before last page -->
        {#if page < totalPages - 2}
          <button class="join-item btn btn-sm" disabled>...</button>
        {/if}

        <!-- Last Page -->
        {#if page < totalPages}
          <button
            class="join-item btn btn-sm"
            onclick={() => goToPage(totalPages)}
          >
            {totalPages}
          </button>
        {/if}

        <!-- Next Page -->
        <button
          class="join-item btn btn-sm"
          onclick={goToNextPage}
          disabled={page >= totalPages}
        >
          <ChevronRight class="size-4" />
        </button>
      </div>

      <!-- Page Info -->
      <div class="text-sm text-base-content/70">
        Page {page} of {totalPages} • {itemsLength} items
      </div>
    </div>
  </div>
{/if}
