<script lang="ts">
  import { X } from "@lucide/svelte";
  import type { ClassValue } from "svelte/elements";

  import { portal } from "@/shared/actions/portal";

  import Button from "./Button.svelte";

  interface Props {
    open?: boolean;
    id?: string;
    class?: ClassValue;
    children?: any;
    onclose?: () => void;
    backdrop?: boolean;
    placement?: "top" | "bottom" | "left" | "right" | "center";
    order?: number;
  }

  let {
    id = "body",
    class: className = "",
    open = $bindable(false),
    children,
    onclose,
    placement = "center",
    backdrop = true,
  }: Props = $props();

  let dialogElement: HTMLDialogElement | null = $state(null);

  let placementClass = $derived.by(() => {
    switch (placement) {
      case "top":
        return "modal-top";
      case "bottom":
        return "modal-bottom";
      case "left":
        return "modal-start";
      case "right":
        return "modal-end";
      case "center":
        return "modal-middle";
    }
  });

  $effect(() => {
    if (open && dialogElement) {
      dialogElement.showModal();
    } else if (!open && dialogElement) {
      dialogElement.close();
    }
  });

  function handleClose() {
    open = false;
    onclose?.();
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === dialogElement) {
      handleClose();
    }
  }
</script>

<div use:portal={id}>
  <dialog
    bind:this={dialogElement}
    class={["modal", placementClass]}
    onclick={handleBackdropClick}
  >
    <div class={["modal-box relative", className]}>
      <div class="absolute top-2 right-2">
        <Button color="neutral" style="ghost" onclick={handleClose} circle>
          <X size={24} />
        </Button>
      </div>

      {@render children()}
    </div>
  </dialog>
</div>
