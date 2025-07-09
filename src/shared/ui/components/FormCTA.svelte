<script lang="ts">
  import { X } from "@lucide/svelte";
  import { actions } from "astro:actions";
  import { onMount } from "svelte";

  let modal: HTMLDialogElement | null = $state(null);
  let contact = $state("");
  let message = $state("");

  let source = $state("");

  onMount(() => {
    source = window.location.href;
  });

  function closeModal() {
    modal?.close();
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    const { data, error } = await actions.sendTG({ contact, message, source });

    if (error) {
      console.error("sendTG error:", error);
    } else {
      contact = "";
      message = "";
      closeModal();
    }
  }
</script>

<dialog
  id="CTAMainModal"
  bind:this={modal}
  aria-modal="true"
  aria-labelledby="contact-title"
  class="modal"
>
  <div class="modal-box">
    <header class="flex justify-between items-center mb-4">
      <h2 id="contact-title" class="text-2xl font-bold">Let’s Keep in Touch</h2>
      <button
        type="button"
        aria-label="Close dialog"
        onclick={closeModal}
        class="btn btn-sm btn-circle btn-ghost"
      >
        <X />
      </button>
    </header>

    <form onsubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="contact-input" class="block font-medium mb-1">
          Your Email or Phone
        </label>
        <input
          id="contact-input"
          bind:value={contact}
          required
          type="text"
          placeholder="you@example.com || +7 800 7777777"
          class="input w-full"
        />
      </div>

      <div>
        <label for="message-textarea" class="block font-medium mb-1">
          Message
        </label>
        <textarea
          id="message-textarea"
          bind:value={message}
          rows="4"
          placeholder="Tell us what you’re looking for..."
          class="textarea textarea-bordered w-full resize-none"
        ></textarea>
      </div>

      <footer class="flex justify-end gap-2 mt-6">
        <button type="button" onclick={closeModal} class="btn btn-outline">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" disabled={!contact}>
          Send Message
        </button>
      </footer>
    </form>
  </div>
</dialog>
