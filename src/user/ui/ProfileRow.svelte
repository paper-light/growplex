<script lang="ts">
  import { ChevronUp } from "@lucide/svelte";
  import { navigate } from "astro:transitions/client";
  import type { ClassValue } from "svelte/elements";

  import { userProvider } from "@/user/user.svelte";
  import { subscriptionProvider } from "@/billing/providers/subscription.svelte";
  import { pb } from "@/shared/lib/pb";
  import Man from "@/shared/assets/Man.jpg";
  import { clickOutside } from "@/shared/actions/click-outside";
  import Button from "@/shared/ui/Button.svelte";

  interface Props {
    class?: ClassValue;
    active: string;
  }
  let { class: className, active }: Props = $props();

  let open = $state(false);

  const user = $derived(userProvider.user);
  const subscription = $derived(subscriptionProvider.subscription);

  const avatar = $derived(
    user?.avatar ? pb.files.getURL(user, user.avatar) : Man.src
  );

  function handleLogout() {
    pb.authStore.clear();
    navigate("/app/auth/sign-in");
  }
</script>

<!-- TRIGGER -->
<button
  use:clickOutside={{ callback: () => (open = false) }}
  class={[
    "flex items-center gap-2 justify-between dropdown dropdown-top dropdown-center bg-base-200 rounded-2xl p-1 border border-base-300 cursor-pointer",
    className,
  ]}
  class:dropdown-open={open}
  onclick={() => (open = true)}
>
  <div class="size-10 rounded-full overflow-hidden">
    <img src={avatar} alt="avatar" />
  </div>

  <div class="flex flex-col flex-1 h-full gap-1">
    <p class="text-sm font-semibold truncate">{user?.name}</p>
    <p class="badge-primary font-semibold badge badge-sm">
      Gas: {subscription?.gas.toFixed(2)}
    </p>
  </div>

  <div>
    <ChevronUp class="size-6" />
  </div>

  <!-- MENU -->
  <ul
    class="dropdown-content menu bg-base-200 rounded-box shadow p-2 w-full space-y-1"
  >
    <li>
      <Button
        size="sm"
        style={active === "Profile" ? "soft" : "ghost"}
        color={active === "Profile" ? "primary" : "neutral"}
        href="/app/profile"
      >
        Profile
      </Button>
      <Button
        size="sm"
        style={active === "Billing" ? "soft" : "ghost"}
        color={active === "Billing" ? "primary" : "neutral"}
        href="/app/billing"
      >
        Billing
      </Button>
    </li>
    <li>
      <Button size="sm" style="soft" color="error" onclick={handleLogout}
        >Logout</Button
      >
    </li>
  </ul>
</button>
