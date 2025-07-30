<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { MessagesEventOptions } from "@/shared/models/pocketbase-types";
  interface Props {
    class?: ClassValue;
    type: MessagesEventOptions;
  }

  let { type, class: className }: Props = $props();
</script>

<div
  class={[
    className,
    "divider",
    "w-full flex justify-center items-center",
    "text-sm text-base-content/70",
  ]}
>
  {#if type === MessagesEventOptions.callOperator}
    <p>Waiting for operator...</p>
  {:else if type === MessagesEventOptions.operatorConnected}
    <p>Operator connected</p>
  {/if}
</div>
