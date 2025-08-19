<script lang="ts">
  import { onMount } from "svelte";

  import Button from "../Button.svelte";

  interface Props {
    title: string;
    description: string;
    buttonText: string;

    href?: string;
    modalId?: string;
    overlay?: boolean;
    image: string;

    position?: "left" | "right";
    center?: boolean;
  }

  const {
    title,
    description,
    buttonText,
    image,
    href,
    overlay = false,
    center = true,
    position = "right",
    modalId,
  }: Props = $props();

  let modalElement: HTMLDialogElement | null = $state(null);

  onMount(() => {
    if (modalId) {
      const interval = setInterval(() => {
        modalElement = document.getElementById(modalId) as HTMLDialogElement;
        if (modalElement) clearInterval(interval);
      }, 200);

      return () => clearInterval(interval);
    }
  });
</script>

<section
  class={["hero min-h-screen relative", !overlay && "bg-base-200"]}
  style={overlay && image ? `background-image: url(${image});` : ""}
>
  {#if overlay && image}
    <div class="hero-overlay"></div>
  {/if}

  <div
    class={[
      "hero-content flex-col gap-6",
      position === "left" && "lg:flex-row",
      position === "right" && "lg:flex-row-reverse",
      overlay && center && "text-center",
      overlay && "text-neutral-content",
    ]}
  >
    {#if image && !overlay}
      <img src={image} class="max-w-sm rounded-2xl shadow-2xl" alt={title} />
    {/if}

    <div class="max-w-md space-y-4">
      <h1
        class="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
      >
        {title}
      </h1>
      <p class="py-6 font-semibold text-shadow-lg">
        {description}
      </p>
      <Button {href} size="lg" onclick={() => modalElement?.showModal()}>
        {buttonText}
      </Button>
    </div>
  </div>

  <div class="absolute bottom-16 w-full flex justify-center">
    <span class="loading loading-ball loading-xl text-primary"></span>
  </div>
</section>
