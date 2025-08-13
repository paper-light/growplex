<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import { ChevronDown } from "@lucide/svelte";

  import { clickOutside } from "../actions/click-outside";
  import Button from "./Button.svelte";

  interface Props {
    options: {
      label: string;
      value: string;
    }[];
    open?: boolean;
    selected?: string;
    class?: ClassValue;
    onclose?: () => void;
    onselect?: (value: string) => void;
    children?: Snippet;
    badge?: Snippet;

    mainActions?: Snippet;
    rowActions?: Snippet;
    endActions?: Snippet;
  }
  let {
    open = $bindable(false),
    options,
    selected,
    class: className,
    onclose,
    onselect,
    children,
    badge,
    mainActions,
    rowActions,
    endActions,
  }: Props = $props();

  const selectedOption = $derived(options.find((o) => o.value === selected));

  function close() {
    open = false;
    onclose?.();
  }
</script>

<details
  bind:open
  use:clickOutside={{
    callback: close,
  }}
  class={["dropdown relative", className]}
>
  <summary class="btn btn-block btn-ghost truncate justify-between">
    {@render badge?.()}

    {#if selectedOption}
      <span class="font-semibold">{selectedOption.label}</span>
    {:else if children}
      <span class="font-semibold">{@render children()}</span>
    {/if}

    {#if mainActions}
      {@render mainActions()}
    {:else}
      <ChevronDown size={14} />
    {/if}
  </summary>

  <ul class="dropdown-content menu bg-base-100 rounded-box shadow w-full mt-1">
    <div class="max-h-80 overflow-y-auto">
      {#each options as option}
        <Button
          block
          color={option.value === selected ? "primary" : "neutral"}
          style="ghost"
          class={[option.value === selected && "text-primary hover:text-black"]}
          onclick={() => {
            onselect?.(option.value);
          }}
        >
          <span class="font-semibold truncate">{option.label}</span>
        </Button>
      {/each}
    </div>

    {@render endActions?.()}
  </ul>
</details>
