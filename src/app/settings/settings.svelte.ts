import type { z } from "zod";
import {
  OrgSchema,
  ProjectSchema,
  SettingsSchema,
  UserSchema,
} from "../../models";
import { authProvider } from "../auth/auth.svelte";

const raw = localStorage.getItem("settings");

class SettingsProvider {
  settings = $state(
    raw
      ? SettingsSchema.parse(JSON.parse(raw))
      : authProvider.user
      ? this.initFromUser(authProvider.user)
      : null
  );

  currentOrg = $derived(this.settings?.currentOrg || null);
  currentProject = $derived(this.settings?.currentProject || null);

  initFromUser(
    user: z.infer<typeof UserSchema>
  ): z.infer<typeof SettingsSchema> {
    const org =
      user?.expand?.orgMembers?.find((om) => om.role === "owner")?.expand
        ?.org || null;
    const proj = org?.expand?.projects ? org?.expand?.projects[0] : null;

    const settings = {
      currentOrg: org,
      currentProject: proj,
    };

    localStorage.setItem("settings", JSON.stringify(settings));
    return settings;
  }

  setCurrentOrg(org: z.infer<typeof OrgSchema>) {
    if (!this.settings) return;

    this.settings.currentOrg = org;
    localStorage.setItem("settings", JSON.stringify(this.settings));
  }
  setCurrentProject(project: z.infer<typeof ProjectSchema>) {
    if (!this.settings) return;

    this.settings.currentProject = project;
    localStorage.setItem("settings", JSON.stringify(this.settings));
  }
}

export const settingsProvider = new SettingsProvider();
