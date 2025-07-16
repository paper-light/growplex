import type { AuthRecord } from "pocketbase";

import { pb } from "../shared/lib/pb";
import type { UsersResponse } from "../shared/models/pocketbase-types";
import type { UserExpandStrict } from "../shared/models/expands";

const EXPAND_KEYS = [
  "orgMembers",
  "orgMembers.org",
  "orgMembers.org.projects",
  "orgMembers.org.projects.integrations",
  "orgMembers.org.projects.agents",
  "orgMembers.org.projects.sources",
  "orgMembers.org.projects.chats",

  "orgMembers.org.projects.integrations.agent",
  "orgMembers.org.projects.integrations.chat",
  "orgMembers.org.projects.integrations.operators",
].join(",");

export async function initData(saveToPb = true) {
  try {
    const data = await pb.collection("users").authRefresh({
      expand: EXPAND_KEYS,
    });
    if (saveToPb) pb.authStore.save(data.token, data.record as AuthRecord);
    return data.record as UsersResponse<unknown, UserExpandStrict>;
  } catch (error) {
    console.error("Failed to init data:", error);
    return null;
  }
}
