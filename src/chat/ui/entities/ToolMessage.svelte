<script lang="ts">
  type Props = {
    type: "waitingOperator" | "operatorConnected";
    class?: string;
  };

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
  {#if type === "waitingOperator"}
    <p>Waiting for operator...</p>
  {:else if type === "operatorConnected"}
    <p>Operator connected</p>
  {/if}
</div>
