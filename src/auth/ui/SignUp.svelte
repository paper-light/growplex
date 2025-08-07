<script lang="ts">
  import { navigate } from "astro:transitions/client";

  import { pb } from "@/shared/lib/pb";

  import Oauth from "@/auth/ui/Oauth.svelte";
  import type { AuthError } from "@/auth/lib/models";

  let username = $state("");
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let agreed = $state(false);
  let loading = $state(false);
  let error: AuthError | null = $state(null);

  let disabled = $derived(
    email.length === 0 ||
      password.length === 0 ||
      username.length === 0 ||
      password !== confirmPassword ||
      !agreed
  );

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    error = null;
    loading = true;

    if (password !== confirmPassword) {
      error = { message: "Passwords do not match" };
      return;
    }

    try {
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm: confirmPassword,
        name: username,
      });
      await pb.collection("users").authWithPassword(email, password, {
        expand: "orgMembers,orgMembers.org",
      });
      await navigate("/app");
      await pb.collection("users").requestVerification(email);
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  };
</script>

<div class="max-w-md mx-auto mt-8 px-4">
  <h1 class="text-3xl font-bold text-center mb-6">Create New Account</h1>

  <div class="mb-4">
    <Oauth bind:loading bind:error />
  </div>

  <div class="divider">OR</div>

  <form onsubmit={onSubmit} class="card bg-base-100 shadow-lg p-6 space-y-4">
    <!-- Username -->
    <div class="form-control w-full">
      <label for="username" class="label">
        <span class="label-text">Username*</span>
      </label>
      <input
        id="username"
        type="text"
        placeholder="Your username"
        bind:value={username}
        required
        class="input input-bordered w-full"
      />
    </div>

    <!-- Email -->
    <div class="form-control w-full">
      <label for="email" class="label">
        <span class="label-text">Email*</span>
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
        <span class="label-text">Password*</span>
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

    <!-- Confirm Password -->
    <div class="form-control w-full">
      <label for="confirmPassword" class="label">
        <span class="label-text">Confirm Password*</span>
      </label>
      <input
        id="confirmPassword"
        type="password"
        placeholder="••••••••"
        bind:value={confirmPassword}
        required
        class="input input-bordered w-full"
      />
    </div>

    <!-- Terms Checkbox -->
    <div class="form-control w-full">
      <label for="agree" class="cursor-pointer label flex items-center">
        <input
          id="agree"
          type="checkbox"
          bind:checked={agreed}
          class="checkbox checkbox-primary mr-2"
        />
        <span class="label-text">
          I agree to the
          <a target="_blank" href="/terms-and-privacy" class="link link-primary"
            >Terms and Privacy</a
          >
        </span>
      </label>
    </div>

    <!-- Submit Button -->
    <div class="form-control w-full mt-2">
      <button type="submit" class="btn btn-primary w-full" {disabled}>
        {#if loading}
          Loading…
        {:else}
          Create Account
        {/if}
      </button>
    </div>
  </form>

  <p class="text-center text-sm mt-4">
    Already have an account?
    <a href="/app/auth/sign-in" class="link link-secondary font-semibold"
      >Sign in!</a
    >
  </p>
</div>
