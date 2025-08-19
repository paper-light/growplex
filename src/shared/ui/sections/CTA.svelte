<script lang="ts">
  import { onMount } from "svelte";
  import Button from "../Button.svelte";

  interface Props {
    headline: string;
    subheadline: string;
    buttonText?: string;
    buttonHref?: string;
    modalId?: string;
    theme?: "default" | "dark" | "gradient";
  }

  const {
    headline,
    subheadline,
    buttonText = "Get Started",
    buttonHref,
    modalId,
    theme = "default",
  }: Props = $props();

  let containerRef: HTMLElement | null = $state(null);
  let isVisible = $state(false);
  let modalElement: HTMLDialogElement | null = $state(null);

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef) {
      observer.observe(containerRef);
    }

    if (modalId) {
      const interval = setInterval(() => {
        modalElement = document.getElementById(modalId) as HTMLDialogElement;
        if (modalElement) clearInterval(interval);
      }, 200);

      return () => clearInterval(interval);
    }

    return () => observer.disconnect();
  });
</script>

<section
  bind:this={containerRef}
  class={[
    "w-full py-16 lg:py-24",
    theme === "dark" && "bg-base-300",
    theme === "gradient" && "bg-gradient-to-br from-primary/10 to-secondary/10",
  ]}
>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div
      class={[
        "text-center space-y-8 transition-all duration-1000 ease-out",
        isVisible && "opacity-100 translate-y-0",
        !isVisible && "opacity-0 translate-y-8",
      ]}
    >
      <!-- Headline -->
      <h2 class="text-4xl lg:text-6xl font-bold leading-tight">
        {headline}
      </h2>

      <!-- Subheadline -->
      <p
        class="text-xl lg:text-2xl text-base-content/70 leading-relaxed max-w-3xl mx-auto"
      >
        {subheadline}
      </p>

      <!-- CTA Button -->
      <div class="pt-8 px-12">
        <Button
          style="outline"
          href={buttonHref}
          size="xl"
          block
          onclick={() => modalElement?.showModal()}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  </div>
</section>
