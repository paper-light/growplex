<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Rocket } from "@lucide/svelte";

  import Button from "../../shared/ui/lib/Button.svelte";

  interface Props {
    class?: ClassValue;
    domain: string;
    disabled?: boolean;
  }

  let { domain, class: className = "", disabled = false }: Props = $props();

  async function onclick() {
    console.log("clicked", domain);
  }
</script>

<div class={className}>
  <Button color="secondary" size="sm" style="outline" {onclick} {disabled}>
    Teach agent about this domain <Rocket class="size-4" />
  </Button>
</div>
