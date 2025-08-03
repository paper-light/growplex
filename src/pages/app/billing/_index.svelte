<script lang="ts">
  import { subscriptionProvider } from "@/billing/providers/subscription.svelte";

  const subscription = $derived(subscriptionProvider.subscription);
</script>

<div>
  {JSON.stringify(subscription)}
  <h1>Billing</h1>
</div>
