<script lang="ts">
  import { BILLING_LIMITS } from "@/billing/config";
  import { subscriptionProvider } from "@/billing/providers/subscription.svelte";

  const subscription = $derived(subscriptionProvider.subscription);
</script>

{#if subscription}
  <div class="flex flex-col gap-2 max-w-xl px-6 py-8">
    <h1 class="text-xl font-semibold">Billing</h1>
    <p class="text-sm text-gray-500">
      You are on the {subscription.tier} tier. All unused gas will be saved for next
      month.
    </p>

    <div class="flex justify-between items-center text-lg font-semibold">
      <div>
        <p>
          Started: {new Date(subscription?.subscribed).toLocaleDateString()}
        </p>
        <div>
          {subscription.thaliaGas}
        </div>
      </div>
      <div>
        <p>Expires: {new Date(subscription?.ended).toLocaleDateString()}</p>
        <div class="text-end">
          {BILLING_LIMITS[subscription?.tier]}
        </div>
      </div>
    </div>

    <progress
      value={subscription.thaliaGas}
      max={BILLING_LIMITS[subscription.tier]}
      class="progress progress-primary max-w-xl"
    ></progress>
  </div>
{/if}
