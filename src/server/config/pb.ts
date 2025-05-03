import PocketBase from "pocketbase";
import { PUBLIC_PB_URL } from "astro:env/client";
import { PB_ID, PB_PASSWORD } from "astro:env/server";

const pb = new PocketBase(PUBLIC_PB_URL);

export const pbReady = pb
  .collection("_superusers")
  .authWithPassword(PB_ID, PB_PASSWORD)
  .then(() => pb);
