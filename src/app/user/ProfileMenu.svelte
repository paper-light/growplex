<script lang="ts">
  import { onMount } from "svelte";
  import { PUBLIC_PB_URL } from "astro:env/client";
  import { ChevronDown } from "@lucide/svelte";

  import { authProvider } from "../auth/auth.svelte";
  import { navigate } from "astro:transitions/client";

  const user = $derived(authProvider.user);

  const avatar = $derived(
    user?.avatar
      ? `${PUBLIC_PB_URL}/api/files/users/${user.id}/${user.avatar}`
      : "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
  );

  let open = $state(false);

  function toggle() {
    open = !open;
  }
  function close() {
    open = false;
  }
  function handleLogout() {
    authProvider.logout();
    close();
    navigate("/app/auth/sign-in");
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
    <li><a class="font-semibold" href="/app/profile">Profile</a></li>
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
