<script lang="ts">
  import { actions } from "astro:actions";

  import Button from "@/shared/ui/Button.svelte";
  import Input from "@/shared/ui/Input.svelte";
  import Modal from "@/shared/ui/Modal.svelte";
  import TextArea from "@/shared/ui/TextArea.svelte";

  interface Props {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    onFinish?: () => void;
  }

  const { onSuccess, onError, onFinish }: Props = $props();

  let open = $state(false);

  let type: "feedback" | "support" = $state("feedback");
  let title = $state("");
  let message = $state("");

  let err = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();

    const { error } = await actions.sendFeedback({
      type,
      title,
      message,
    });

    if (error) {
      err = error.message;
      onError?.(error);
    } else {
      title = "";
      message = "";
      err = "";
      open = false;
      onSuccess?.();

      // @ts-ignore
      document.getElementById("FeedbackModal")?.close();
    }

    onFinish?.();
  }
</script>

<Modal bind:open id="FeedbackModal">
  <form onsubmit={handleSubmit} class="space-y-4 p-4">
    <div class="flex items-center gap-2">
      <Button
        color={type === "feedback" ? "primary" : "neutral"}
        style={type === "feedback" ? "soft" : "ghost"}
        class="flex-1"
        type="button"
        onclick={() => (type = "feedback")}>Feedback</Button
      >
      <Button
        color={type === "support" ? "primary" : "neutral"}
        style={type === "support" ? "soft" : "ghost"}
        class="flex-1"
        type="button"
        onclick={() => (type = "support")}>Support</Button
      >
    </div>

    <Input
      legend="Topic"
      color="neutral"
      class="w-full"
      required
      bind:value={title}
      placeholder="Integration error"
    ></Input>

    <TextArea
      color="neutral"
      class="w-full"
      rows={4}
      bind:value={message}
      placeholder="Describe the issue or provide feedback...">Message</TextArea
    >

    <footer class="flex justify-end gap-2 mt-6">
      <Button type="submit" disabled={!title}>Submit</Button>
    </footer>
  </form>
</Modal>
