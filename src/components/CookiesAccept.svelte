<script lang="ts">
  import { onMount } from "svelte";

  let ok = $state(true);

  onMount(() => {
    ok = localStorage.getItem("okCookies") === "true";
  });
</script>

{#if !ok}
  <div class="toast toast-start">
    <div
      class="alert px-4 py-3 shadow-lg border-secondary rounded-xl flex flex-col"
    >
      <span class="text-lg font-semibold">We use cookies :3</span>
      <a class="link link-hover font-bold" href="terms-and-privacy"
        >Terms & Privacy</a
      >
      <button
        class="self-end btn btn-primary btn-lg"
        onclick={() => {
          localStorage.setItem("okCookies", "true");
          ok = true;
        }}
      >
        Ok
      </button>
    </div>
  </div>
{/if}
