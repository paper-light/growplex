<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Dropdown from "@/shared/ui/Dropdown.svelte";
  import { settingsProvider } from "@/user/settings.svelte";
  import { userProvider } from "@/user/user.svelte";

  interface Props {
    class?: ClassValue;
  }
  const { class: className }: Props = $props();

  let open = $state(false);

  const orgs = $derived(userProvider.orgs);
  const selectedOrgId = $derived(userProvider.selectedOrg?.id);
</script>

<div class={className}>
  <Dropdown
    bind:open
    class="w-42 border border-base-300 rounded-md"
    selected={selectedOrgId}
    options={orgs.map((o) => ({
      value: o.id,
      label: o.name,
    }))}
    onselect={(orgId) => {
      settingsProvider.selectOrg(orgId);
      open = false;
    }}
  >
    {#snippet badge()}
      <span class="absolute left-0 -top-1 text-info font-semibold text-xs">
        org
      </span>
    {/snippet}
  </Dropdown>
</div>
