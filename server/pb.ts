import PocketBase from "pocketbase";

export const pbReady = (async () => {
  const pb = new PocketBase(process.env.PUBLIC_PB_URL);
  await pb
    .collection("_superusers")
    .authWithPassword(process.env.PB_ID!, process.env.PB_PASSWORD!);
  return pb;
})();
