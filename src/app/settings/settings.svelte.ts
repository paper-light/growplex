import type { z } from "zod";
import {
  IntegrationSchema,
  OrgSchema,
  ProjectSchema,
  SettingsSchema,
  UserSchema,
} from "../../models";
import { authProvider } from "../auth/auth.svelte";


class SettingsProvider {
  settings: z.infer<typeof SettingsSchema> | null = $state(null);

  currentOrg = $derived(this.settings?.currentOrg || null);
  currentProject = $derived(this.settings?.currentProject || null);
  currentIntegration = $derived(this.settings?.currentIntegration || null)

  init() {
    const raw = localStorage.getItem("settings");
    if (raw) {
      this.settings = SettingsSchema.parse(JSON.parse(raw));
    } else if (authProvider.user) {
      this.settings = this.initFromUser(authProvider.user)
    }
  }

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
      if (org) this.settings!.currentOrg = org
    }
    if (this.currentProject) {
      const proj = user.expand?.orgMembers?.find(o => o.org === this.currentOrg!.id)?.expand?.org?.expand?.projects?.find(p => p.id === this.currentProject?.id)
      if (proj) this.settings!.currentProject = proj
    }
    if (this.currentProject && this.currentIntegration) {
      const integ = user.expand?.orgMembers?.find(o => o.org === this.currentOrg!.id)?.expand?.org?.expand?.projects?.find(p => p.id === this.currentProject?.id)?.expand?.integrations?.find(i => i.id === this.currentIntegration?.id)
      if (integ) this.settings!.currentIntegration = integ
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
    console.log(project.name)

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
