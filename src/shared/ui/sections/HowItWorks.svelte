<script lang="ts">
  import { onMount } from "svelte";

  interface Step {
    number: number;
    title: string;
    description: string;
    image?: string;
  }

  interface Props {
    title: string;
    subtitle?: string;
    steps: Step[];
    theme?: "default" | "dark" | "gradient";
  }

  const { title, subtitle, steps, theme = "default" }: Props = $props();

  let containerRef: HTMLElement | null = $state(null);
  let isVisible = $state(false);

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

    return () => observer.disconnect();
  });
</script>

<section
  bind:this={containerRef}
  class={[
    "w-full py-16 lg:py-24",
    theme === "dark" && "bg-base-300",
    theme === "gradient" && "bg-gradient-to-br from-info/5 to-primary/5",
  ]}
>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-16 space-y-4">
      {#if subtitle}
        <p class="text-sm font-semibold text-info uppercase tracking-wide">
          {subtitle}
        </p>
      {/if}

      <h2 class="text-4xl lg:text-5xl font-bold leading-tight">
        {title}
      </h2>
    </div>

    <!-- Timeline -->
    <div
      class={[
        "transition-all duration-1000 ease-out",
        isVisible && "opacity-100 translate-y-0",
        !isVisible && "opacity-0 translate-y-8",
      ]}
    >
      <ul
        class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical"
      >
        {#each steps as step, index}
          <li class={index % 2 === 0 ? "" : "timeline-reverse"}>
            {#if index > 0}
              <hr />
            {/if}

            <div class="timeline-middle">
              <div
                class="w-8 h-8 bg-info text-info-content rounded-full flex items-center justify-center font-bold text-sm shadow-lg"
              >
                {step.number}
              </div>
            </div>

            <div
              class={index % 2 === 0
                ? "timeline-start mb-10 md:text-end"
                : "timeline-end md:mb-10"}
            >
              <div
                class="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div class="text-lg font-black text-info mb-2">
                  {step.title}
                </div>
                <p class="text-base-content/70 leading-relaxed">
                  {step.description}
                </p>

                {#if step.image}
                  <div class="mt-6">
                    <img
                      src={step.image}
                      alt={step.title}
                      class="w-full h-80 md:h-96 object-cover rounded-xl shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    />
                  </div>
                {/if}
              </div>
            </div>

            {#if index < steps.length - 1}
              <hr />
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>
