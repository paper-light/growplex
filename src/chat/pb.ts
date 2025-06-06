import PocketBase from "pocketbase";
import { PUBLIC_PB_URL } from "astro:env/client";

export const pb = new PocketBase(PUBLIC_PB_URL);
