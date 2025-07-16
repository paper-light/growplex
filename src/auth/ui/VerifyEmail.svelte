<script lang="ts">
  import { navigate } from "astro:transitions/client";

  import { pb } from "../../shared/lib/pb";
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] gap-6">
  <h1 class="text-3xl font-bold">
    Verify your email {pb.authStore.record?.email || ""}
  </h1>
  <p class="text-base text-center max-w-md">
    Please check your inbox and click the verification link we sent to your
    email address.<br />
    Once verified, you can continue to the app.
  </p>
  <button class="btn btn-primary w-48" onclick={() => navigate("/app")}>
    Go to the App
  </button>
</div>
