<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { portal } from "../../../shared/actions/portal";

  interface Props {
    open?: boolean;
    id?: string;
    class?: ClassValue;
  }

  let {
    id = "body",
    class: className = "",
    open = $bindable(false),
  }: Props = $props();
</script>

<div use:portal={id} class={className}>
  <input type="checkbox" class="modal-toggle" bind:checked={open} />
  <div class="modal">
    <div class="modal-box"></div>
  </div>
</div>
