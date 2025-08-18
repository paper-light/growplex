<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  interface Props {
    class?: ClassValue;
    type: string;
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
  {#if type === "callOperator"}
    <p>Waiting for operator...</p>
  {:else if type === "operatorConnected"}
    <p>Operator connected</p>
  {:else if type === "operatorDisconnected"}
    <p>Operator disconnected</p>
  {/if}
</div>
