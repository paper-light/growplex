<script lang="ts">
  import { z } from "zod";

  import { navigate } from "astro:transitions/client";
  import { PUBLIC_PB_URL } from "astro:env/client";

  import { authProvider } from "./auth.svelte";
  import { pb } from "../shared/lib/pb";
  import { Check, X, Edit, Upload } from "@lucide/svelte";

  const user = $derived(authProvider.user);
  const avatar = $derived(
    user?.avatar
      ? `${PUBLIC_PB_URL}/api/files/users/${user.id}/${user.avatar}`
      : null
  );

  // OAuth detection
  const isOAuthUser = $derived(
    user?.metadata
      ? (user.metadata as any).provider || (user.metadata as any).oauth2
      : false
  );

  const oauthProvider = $derived(
    user?.metadata
      ? (user.metadata as any).provider ||
          (user.metadata as any).oauth2?.provider ||
          null
      : null
  );

  // Edit mode states
  let editingName = $state(false);
  let editingEmail = $state(false);
  let editingPassword = $state(false);

  // Modal states
  let showPasswordModal = $state(false);

  // Form values
  let nameValue = $state(authProvider.user?.name || "");
  let emailValue = $state(pb.authStore.record?.email || "");
  let passwordValue = $state("");
  let oldPasswordValue = $state("");

  // Loading states
  let savingName = $state(false);
  let savingEmail = $state(false);
  let savingPassword = $state(false);

  // Error states
  let nameError = $state("");
  let emailError = $state("");
  let passwordError = $state("");
  let oldPasswordError = $state("");

  // Validation schemas
  const nameSchema = z.string().min(1, "Name is required");
  const emailSchema = z.email("Please enter a valid email address");
  const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters");

  async function updateUserField(
    field: string,
    value: any,
    validationSchema?: z.ZodSchema
  ) {
    try {
      if (validationSchema) {
        validationSchema.parse(value);
      }

      let data: Record<string, any> = {};
      if (field === "password") {
        data = { password: value, passwordConfirm: value };
      } else {
        data[field] = value;
      }

      await pb.collection("users").update(user!.id, data);
      await authProvider.refreshUser();
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      } else {
        return `Failed to update ${field}`;
      }
    }
  }

  // Name field functions
  function startEditName() {
    nameValue = user?.name || "";
    nameError = "";
    editingName = true;
  }

  function cancelEditName() {
    editingName = false;
    nameError = "";
  }

  async function saveName() {
    savingName = true;
    const result = await updateUserField("name", nameValue, nameSchema);
    if (result === true) {
      editingName = false;
      nameError = "";
    } else {
      nameError = result;
    }
    savingName = false;
  }

  // Email field functions
  function startEditEmail() {
    emailValue = pb.authStore.record?.email || "";
    emailError = "";
    editingEmail = true;
  }

  function cancelEditEmail() {
    editingEmail = false;
    emailError = "";
  }

  async function saveEmail() {
    try {
      emailSchema.parse(emailValue);
      savingEmail = true;

      await pb.collection("users").requestEmailChange(emailValue);

      editingEmail = false;
      emailError = "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        emailError = error.errors[0].message;
      } else {
        emailError = "Failed to request email change";
      }
    } finally {
      savingEmail = false;
    }
  }

  // Password field functions
  function startEditPassword() {
    passwordValue = "";
    oldPasswordValue = "";
    passwordError = "";
    oldPasswordError = "";
    showPasswordModal = true;
  }

  function cancelEditPassword() {
    showPasswordModal = false;
    passwordValue = "";
    oldPasswordValue = "";
    passwordError = "";
    oldPasswordError = "";
  }

  async function savePassword() {
    try {
      if (!oldPasswordValue.trim()) {
        oldPasswordError = "Current password is required";
        return;
      }

      passwordSchema.parse(passwordValue);
      savingPassword = true;

      const res = await pb.collection("users").update(user!.id, {
        password: passwordValue,
        passwordConfirm: passwordValue,
        oldPassword: oldPasswordValue,
      });

      await authProvider.logout();
      await navigate("/app/auth/sign-in");

      showPasswordModal = false;
      passwordValue = "";
      oldPasswordValue = "";
      passwordError = "";
      oldPasswordError = "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        passwordError = error.errors[0].message;
      } else {
        passwordError =
          "Failed to update password. Please check your current password.";
      }
    } finally {
      savingPassword = false;
    }
  }

  // Avatar logic
  async function handleAvatarUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || !target.files[0]) return;

    const file = target.files[0];
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await pb.collection("users").update(user!.id, formData);
      await authProvider.refreshUser();
    } catch (error) {
      console.error("Failed to update avatar:", error);
    }
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getProviderBadgeColor(provider: string): string {
    switch (provider?.toLowerCase()) {
      case "google":
        return "badge-primary";
      case "github":
        return "badge-neutral";
      case "facebook":
        return "badge-info";
      case "twitter":
        return "badge-secondary";
      default:
        return "badge-accent";
    }
  }
</script>

<!-- Password Change Modal -->
{#if showPasswordModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Change Password</h3>

      <div class="space-y-4">
        <!-- Current Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Current Password</span>
          </label>
          <input
            type="password"
            bind:value={oldPasswordValue}
            placeholder="Enter your current password"
            class="input input-bordered {oldPasswordError ? 'input-error' : ''}"
          />
          {#if oldPasswordError}
            <div class="text-error text-sm mt-1">{oldPasswordError}</div>
          {/if}
        </div>

        <!-- New Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">New Password</span>
          </label>
          <input
            type="password"
            bind:value={passwordValue}
            placeholder="Enter new password"
            class="input input-bordered {passwordError ? 'input-error' : ''}"
          />
          {#if passwordError}
            <div class="text-error text-sm mt-1">{passwordError}</div>
          {/if}
        </div>
      </div>

      <div class="modal-action">
        <button
          onclick={savePassword}
          disabled={savingPassword}
          class="btn btn-primary"
        >
          {#if savingPassword}
            <div class="loading loading-spinner loading-sm"></div>
            Updating...
          {:else}
            Update Password
          {/if}
        </button>
        <button onclick={cancelEditPassword} class="btn btn-ghost">
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<div class="card bg-base-100 shadow-lg max-w-2xl mx-auto">
  <div class="card-body">
    <!-- Avatar Section -->
    <div class="flex justify-center mb-6">
      <div class="avatar relative">
        <div
          class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden"
        >
          {#if avatar}
            <img src={avatar} alt="Avatar" class="w-full h-full object-cover" />
          {:else}
            <div
              class="w-full h-full bg-base-300 flex items-center justify-center text-3xl font-bold text-base-content"
            >
              {getInitials(user?.name || "U")}
            </div>
          {/if}
        </div>
        <label
          class="btn btn-circle btn-primary btn-sm absolute -bottom-1 -right-1 cursor-pointer"
        >
          <Upload class="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            onchange={handleAvatarUpload}
            class="hidden"
          />
        </label>
      </div>
    </div>

    <!-- OAuth Provider Badge -->
    {#if isOAuthUser && oauthProvider}
      <div class="flex justify-center mb-4">
        <div class="badge {getProviderBadgeColor(oauthProvider)} gap-2">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            ></path>
          </svg>
          Connected via {oauthProvider}
        </div>
      </div>
    {/if}

    <!-- Profile Fields -->
    <div class="space-y-4">
      <!-- Name Field -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Display Name</span>
        </label>
        {#if editingName}
          <div class="flex gap-2 items-center">
            <input
              type="text"
              bind:value={nameValue}
              placeholder="Enter your name"
              class="input input-bordered flex-1 h-12 {nameError
                ? 'input-error'
                : ''}"
            />
            <button
              onclick={saveName}
              disabled={savingName}
              class="btn btn-primary btn-sm h-12 w-12"
            >
              {#if savingName}
                <div class="loading loading-spinner loading-sm"></div>
              {:else}
                <Check class="w-4 h-4" />
              {/if}
            </button>
            <button
              onclick={cancelEditName}
              class="btn btn-ghost btn-sm h-12 w-12"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          {#if nameError}
            <div class="text-error text-sm mt-1">{nameError}</div>
          {/if}
        {:else}
          <div
            class="flex items-center justify-between p-3 bg-base-200 rounded-lg h-12"
          >
            <span class="text-base-content">{user?.name || "Not set"}</span>
            <button onclick={startEditName} class="btn btn-ghost btn-sm">
              <Edit class="w-4 h-4" />
            </button>
          </div>
        {/if}
      </div>

      <!-- Email Field -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Email</span>
        </label>
        {#if editingEmail && !isOAuthUser}
          <div class="flex gap-2 items-center">
            <input
              type="email"
              bind:value={emailValue}
              placeholder="Enter your email"
              class="input input-bordered flex-1 h-12 {emailError
                ? 'input-error'
                : ''}"
            />
            <button
              onclick={saveEmail}
              disabled={savingEmail}
              class="btn btn-primary btn-sm h-12 w-12"
            >
              {#if savingEmail}
                <div class="loading loading-spinner loading-sm"></div>
              {:else}
                <Check class="w-4 h-4" />
              {/if}
            </button>
            <button
              onclick={cancelEditEmail}
              class="btn btn-ghost btn-sm h-12 w-12"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          {#if emailError}
            <div class="text-error text-sm mt-1">{emailError}</div>
          {/if}
        {:else}
          <div
            class="flex items-center justify-between p-3 bg-base-200 rounded-lg h-12"
          >
            <span class="text-base-content"
              >{pb.authStore.record?.email || "Not set"}</span
            >
            {#if !isOAuthUser}
              <button onclick={startEditEmail} class="btn btn-ghost btn-sm">
                <Edit class="w-4 h-4" />
              </button>
            {:else}
              <div class="badge badge-outline badge-sm">
                Managed by {oauthProvider}
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Password Field - Only show for non-OAuth users -->
      {#if !isOAuthUser}
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Password</span>
          </label>
          <div
            class="flex items-center justify-between p-3 bg-base-200 rounded-lg h-12"
          >
            <span class="text-base-content">••••••••</span>
            <button onclick={startEditPassword} class="btn btn-ghost btn-sm">
              <Edit class="w-4 h-4" />
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
