<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import Thalia from "../../assets/Thalia.jpg";

  interface Props {
    class?: ClassValue;
    avatar?: string | null;
    fallbackSrc?: string;
    size?: "sm" | "md" | "lg";
    onChange?: (file: File) => void;
    disabled?: boolean;
  }

  let {
    class: className = "",
    avatar,
    fallbackSrc = Thalia.src,
    size = "md",
    onChange,
    disabled = false,
  }: Props = $props();

  let fileInput: HTMLInputElement | null = $state(null);
  let previewUrl: string | null = $state(null);
  let selectedFile: File | null = $state(null);

  const avatarSrc = $derived(previewUrl || avatar || fallbackSrc);

  const sizeClasses = {
    sm: "size-16",
    md: "size-24",
    lg: "size-32",
  };

  function triggerFileInput() {
    if (!disabled) {
      fileInput?.click();
    }
  }

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      selectedFile = file;
      previewUrl = URL.createObjectURL(file);

      if (onChange) {
        onChange(file);
      }
    }
  }

  $effect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  });
</script>

<div class={className}>
  <div class="relative group">
    <div class="avatar placeholder">
      <div
        class="bg-neutral text-neutral-content rounded-lg {sizeClasses[size]}"
      >
        <img
          src={avatarSrc}
          alt="Avatar"
          class="w-full h-full object-cover rounded-lg"
        />
      </div>
    </div>

    <!-- Edit Icon Overlay -->
    {#if !disabled}
      <button
        aria-label="Edit avatar"
        onclick={triggerFileInput}
        class="hover:cursor-pointer absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
      >
        <svg
          class="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          ></path>
        </svg>
      </button>
    {/if}
  </div>

  <!-- Hidden File Input -->
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    class="hidden"
    onchange={handleFileChange}
    {disabled}
  />
</div>
