<script lang="ts">
  import { navigate } from "astro:transitions/client";

  import type { AuthError } from "@/auth/lib/models";
  import { pb } from "@/shared/lib/pb";
  import Oauth from "@/auth/ui/Oauth.svelte";

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error: AuthError | null = $state(null);

  // enable when both fields have content
  const canSubmit = $derived(email.length > 0 && password.length > 0);

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = null;
    loading = true;

    try {
      await pb.collection("users").authWithPassword(email, password, {
        expand: "orgMembers,orgMembers.org",
      });
      await navigate("/app");
    } catch (err) {
      console.error(err);
      error = err as AuthError;
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-md mx-auto mt-8 px-4">
  <h1 class="text-3xl font-bold text-center mb-6">Sign In to Your Account</h1>

  <!-- OAuth buttons -->
  <div class="mb-4">
    <Oauth bind:loading bind:error />
  </div>

  <div class="divider">OR</div>

  <!-- Sign-in form -->
  <form onsubmit={onSubmit} class="card bg-base-100 shadow-lg p-6 space-y-4">
    <!-- Email -->
    <div class="form-control w-full">
      <label for="email" class="label">
        <span class="label-text">Email</span>
      </label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        bind:value={email}
        required
        class="input input-bordered w-full"
      />
    </div>

    <!-- Password -->
    <div class="form-control w-full">
      <label for="password" class="label">
        <span class="label-text">Password</span>
      </label>
      <input
        id="password"
        type="password"
        placeholder="••••••••"
        bind:value={password}
        required
        class="input input-bordered w-full"
      />
    </div>

    {#if error}
      <p class="text-error text-sm">{error.message}</p>
    {/if}

    <!-- Submit -->
    <div class="form-control w-full mt-2">
      <button
        type="submit"
        class="btn btn-primary w-full"
        disabled={!canSubmit || loading}
      >
        {#if loading}
          Signing In...
        {:else}
          Sign In
        {/if}
      </button>
    </div>
  </form>

  <p class="text-center text-sm mt-4">
    Don’t have an account?
    <a href="/app/auth/sign-up" class="link link-primary font-semibold"
      >Create one</a
    >
  </p>
</div>
