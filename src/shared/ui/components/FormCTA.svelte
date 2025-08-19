<script lang="ts">
  import { navigate } from "astro:transitions/client";
  import { actions } from "astro:actions";

  import Modal from "../Modal.svelte";
  import TextArea from "../TextArea.svelte";
  import Input from "../Input.svelte";
  import Button from "../Button.svelte";

  let contact = $state("");
  let message = $state("");

  let open = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();

    navigate("/app/auth/sign-up");
    const { data, error } = await actions.sendTG({
      contact,
      message,
      source: "<unknown>",
    });

    if (error) {
      console.error("sendTG error:", error);
    } else {
      contact = "";
      message = "";
      open = false;
    }
  }
</script>

<Modal bind:open id="CTAMainModal">
  <form onsubmit={handleSubmit} class="space-y-4">
    <Input
      legend="Your Email or Phone"
      color="neutral"
      class="w-full"
      required
      bind:value={contact}
      placeholder="you@example.com || +7 800 7777777"
    ></Input>

    <TextArea
      color="neutral"
      class="w-full"
      rows={4}
      bind:value={message}
      placeholder="Tell us what you’re looking for...">Message</TextArea
    >

    <footer class="flex justify-end gap-2 mt-6">
      <Button type="submit" disabled={!contact}
        >Submit and go to Growplex Beta</Button
      >
    </footer>
  </form>
</Modal>
