<script lang="ts">
  import { BILLING_LIMITS } from "@/billing/config";
  import { subscriptionProvider } from "@/billing/providers/subscription.svelte";

  const subscription = $derived(subscriptionProvider.subscription);

  import { derived } from "svelte/store";

  function formatDate(dateString?: string) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const subscribed = $derived(formatDate(subscription?.subscribed));
  const expires = $derived(formatDate(subscription?.ended));
</script>

{#if subscription}
  <div class="flex flex-col gap-2 max-w-xl px-6 py-8">
    <h1 class="text-xl font-semibold">Billing</h1>
    <p class="text-sm text-gray-500">
      You are on the {subscription.tier} tier. All unused gas will be saved for next
      month.
    </p>

    <div class="flex justify-between items-center text-lg font-semibold mb-5">
      <div>
        <p>
          Started: {subscribed}
        </p>
      </div>
      <div>
        <p>Expires: {expires}</p>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <p class="text-xl font-semibold text-primary">
        Gas remaining: {subscription.gas.toFixed(4)}
      </p>
      <!-- <progress
        value={subscription.gas}
        max={BILLING_LIMITS[subscription.tier]}
        class="progress progress-primary max-w-xl"
      ></progress> -->
    </div>
  </div>
{/if}
