<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "astro:transitions/client";
  import { ChevronDown } from "@lucide/svelte";

  import { pb } from "../../shared/lib/pb";

  import { userProvider } from "../user.svelte";

  interface Props {
    active: string;
  }

  let { active = "" }: Props = $props();

  const user = $derived(userProvider.user);

  const avatar = $derived(
    user?.avatar
      ? pb.files.getURL(user, user.avatar)
      : "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
  );

  let open = $state(false);

  function toggle() {
    open = !open;
  }
  function close() {
    open = false;
  }
  async function handleLogout() {
    close();
    pb.authStore.clear();
    await navigate("/app/auth/sign-in");
  }

  let rootEl: HTMLElement;
  function onClickOutside(e: MouseEvent) {
    if (!rootEl.contains(e.target as Node)) close();
  }
  onMount(() => {
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  });
</script>

<div class="dropdown dropdown-end" class:dropdown-open={open}>
  <!-- trigger -->
  <button
    class="btn btn-ghost avatar flex items-center gap-2 rounded-2xl p-0"
    onclick={toggle}
  >
    <div class="size-10 rounded-full overflow-hidden">
      <img src={avatar} alt="avatar" />
    </div>
    <ChevronDown />
  </button>

  <!-- menu -->
  <ul
    bind:this={rootEl}
    class="dropdown-content menu bg-base-100 rounded-box w-48 shadow mt-2 p-2"
  >
    <li>
      <a
        class:text-primary={active === "Profile"}
        class="font-semibold"
        href="/app/profile">Profile</a
      >
    </li>
    <li>
      <button
        class="text-error font-semibold w-full text-left"
        onclick={handleLogout}
      >
        Logout
      </button>
    </li>
  </ul>
</div>
