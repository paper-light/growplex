<script lang="ts">
  import { onMount } from "svelte";

  let selectedDark = $state(false);
  let open = $state(false);

  onMount(() => {
    localStorage.getItem("theme") === "dark"
      ? (selectedDark = true)
      : (selectedDark = false);

    window.addEventListener("message", (event) => {
      // проверяем, что сообщение с того же origin, что и ваш сервер
      if (event.origin !== "http://localhost:4321") return;
      const { type, theme } = event.data || {};
      if (type === "theme-change") {
        selectedDark = theme === "dark";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
      }
    });
  });
</script>

{#if open}
  <div class="fixed bottom-0 right-0 m-4 pb-12">
    <div class="bg-white shadow-lg rounded-lg p-4">
      <h2 class="text-xl font-bold">Chat</h2>
      <p>Chat content goes here...</p>
      <button onclick={() => (open = false)}>Close</button>
    </div>
  </div>
{:else}
  <div class="fixed bottom-0 right-0 m-4">
    <button
      class="bg-blue-500 text-white rounded-full p-2 shadow-lg"
      onclick={() => (open = true)}
    >
      Chat
    </button>
  </div>
{/if}
