<script lang="ts">
  import { navigate } from "astro:transitions/client";
  
  import type { AuthError } from "../lib/models";
  import { oauth2 } from "../features/oauth";

  interface Props {
    error?: AuthError | null;
    loading?: boolean;
  }

  let { error = $bindable(null), loading = $bindable(false) }: Props = $props();

  const providers = [
    {
      label: "google",
      name: "Google",
    },
  ];

  const onClick = async (e: MouseEvent) => {
    loading = true;
    try {
      const target = e.currentTarget as HTMLElement;
      await oauth2(target.dataset.provider!);
      await navigate("/app");
    } catch (e) {
      console.error("Error during OAuth2 flow:", e);
    } finally {
      loading = false;
    }
  };
</script>

<aside class="mb-4">
  <ul class="grid grid-cols-1 gap-2">
    {#each providers as provider}
      <li>
        <button
          type="button"
          class="btn btn-outline btn-block w-full"
          onclick={onClick}
          disabled={loading}
          data-provider={provider.label}
        >
          Sign in with {provider.name}
        </button>
      </li>
    {/each}
  </ul>
  {#if error}
    <p class="text-error text-sm mt-2">{error.message}</p>
  {/if}
</aside>
