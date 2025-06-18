import type { z } from "zod";
import {
  IntegrationSchema,
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
  currentIntegration = $derived(this.settings?.currentIntegration || null)

  initFromUser(
    user: z.infer<typeof UserSchema>
  ): z.infer<typeof SettingsSchema> {
    const org =
      user?.expand?.orgMembers?.find((om) => om.role === "owner")?.expand
        ?.org || null;
    const proj = org?.expand?.projects ? org?.expand?.projects[0] : null;
    const integration = proj?.expand?.integrations ? proj?.expand?.integrations[0] : null

    const settings = {
      currentOrg: org,
      currentProject: proj,
      currentIntegration: integration
    };

    localStorage.setItem("settings", JSON.stringify(settings));
    return settings;
  }

  mergeUser(
    user: z.infer<typeof UserSchema> | null
  ) {
    if (!user) return;

    if (this.currentOrg) {
      const org = user.expand?.orgMembers?.find(o => o.org === this.currentOrg!.id)?.expand?.org
      if (org) this.setCurrentOrg(org)
    }
    if (this.currentProject) {
      const proj = user.expand?.orgMembers?.find(o => o.org === this.currentOrg!.id)?.expand?.org?.expand?.projects?.find(p => p.id === this.currentProject?.id)
      if (proj) this.setCurrentProject(proj)
    }
    if (this.currentProject && this.currentIntegration) {
      const integ = user.expand?.orgMembers?.find(o => o.org === this.currentOrg!.id)?.expand?.org?.expand?.projects?.find(p => p.id === this.currentProject?.id)?.expand?.integrations?.find(i => i.id === this.currentIntegration?.id)
      if (integ) this.setCurrentIntegration(integ)
    }
  }

  setCurrentOrg(org: z.infer<typeof OrgSchema>) {
    if (!this.settings) return;

    this.settings.currentOrg = org;
    this.settings.currentProject = org.expand?.projects ? org.expand.projects[0] : null
    this.settings.currentIntegration = this.settings.currentProject?.expand?.integrations ? this.settings.currentProject.expand?.integrations[0] : null
    localStorage.setItem("settings", JSON.stringify(this.settings));
  }
  setCurrentProject(project: z.infer<typeof ProjectSchema>) {
    if (!this.settings) return;

    this.settings.currentProject = project;
    this.settings.currentIntegration = project.expand?.integrations ? project.expand?.integrations[0] : null
    localStorage.setItem("settings", JSON.stringify(this.settings));
  }

  setCurrentIntegration(integration: z.infer<typeof IntegrationSchema>) {
    if (!this.settings) return;
  
    this.settings.currentIntegration = integration;
    localStorage.setItem("settings", JSON.stringify(this.settings))
  }
}

export const settingsProvider = new SettingsProvider();
