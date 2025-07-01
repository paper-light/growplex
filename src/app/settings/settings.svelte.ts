import type { z } from "zod";
import {
  IntegrationSchema,
  OrgSchema,
  ProjectSchema,
  SettingsSchema,
  UserSchema,
} from "../../models";

class SettingsProvider {
  settings: z.infer<typeof SettingsSchema> | null = $state(null);

  currentOrg = $derived(this.settings?.currentOrg || null);
  currentProject = $derived(this.settings?.currentProject || null);
  currentIntegration = $derived(this.settings?.currentIntegration || null);

  init(user?: z.infer<typeof UserSchema> | null) {
    try {
      const raw = localStorage.getItem("settings");
      if (raw) {
        this.settings = SettingsSchema.parse(JSON.parse(raw));
      } else if (user) {
        this.settings = this.initFromUser(user);
      }
    } catch (error) {
      console.error("Failed to initialize settings:", error);
      // Clear corrupted settings
      localStorage.removeItem("settings");
      if (user) {
        this.settings = this.initFromUser(user);
      }
    }
  }

  initFromUser(
    user: z.infer<typeof UserSchema>
  ): z.infer<typeof SettingsSchema> {
    const org =
      user?.expand?.orgMembers?.find((om) => om.role === "owner")?.expand
        ?.org || null;
    const proj = org?.expand?.projects ? org?.expand?.projects[0] : null;
    const integration = proj?.expand?.integrations
      ? proj?.expand?.integrations[0]
      : null;

    const settings = {
      currentOrg: org,
      currentProject: proj,
      currentIntegration: integration,
    };

    this.saveToStorage(settings);
    return settings;
  }

  mergeUser(user: z.infer<typeof UserSchema> | null) {
    if (!user || !this.settings) return;

    let hasChanges = false;

    // Update current org if it exists in user data
    if (this.currentOrg) {
      const org = user.expand?.orgMembers?.find(
        (o) => o.org === this.currentOrg!.id
      )?.expand?.org;
      if (org && JSON.stringify(org) !== JSON.stringify(this.currentOrg)) {
        console.log("Merging org: ", org.name);
        this.settings.currentOrg = org;
        hasChanges = true;
      }
    }

    // Update current project if it exists in user data
    if (this.currentProject && this.currentOrg) {
      const proj = user.expand?.orgMembers
        ?.find((o) => o.org === this.currentOrg!.id)
        ?.expand?.org?.expand?.projects?.find(
          (p) => p.id === this.currentProject?.id
        );
      if (
        proj &&
        JSON.stringify(proj) !== JSON.stringify(this.currentProject)
      ) {
        console.log("Merging project: ", proj.name);
        this.settings.currentProject = proj;
        hasChanges = true;
      }
    }

    // Update current integration if it exists in user data
    if (this.currentProject && this.currentIntegration) {
      const integ = user.expand?.orgMembers
        ?.find((o) => o.org === this.currentOrg!.id)
        ?.expand?.org?.expand?.projects?.find(
          (p) => p.id === this.currentProject?.id
        )
        ?.expand?.integrations?.find(
          (i) => i.id === this.currentIntegration?.id
        );
      if (
        integ &&
        JSON.stringify(integ) !== JSON.stringify(this.currentIntegration)
      ) {
        console.log("Merging integration: ", integ.name);
        this.settings.currentIntegration = integ;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.saveToStorage(this.settings);
    }
  }

  setCurrentOrg(org: z.infer<typeof OrgSchema>) {
    if (!this.settings) return;

    this.settings.currentOrg = org;
    this.settings.currentProject = org.expand?.projects
      ? org.expand.projects[0]
      : null;
    this.settings.currentIntegration = this.settings.currentProject?.expand
      ?.integrations
      ? this.settings.currentProject.expand?.integrations[0]
      : null;
    this.saveToStorage(this.settings);
  }

  setCurrentProject(project: z.infer<typeof ProjectSchema>) {
    if (!this.settings) return;
    console.log("Setting project: ", project.name);

    this.settings.currentProject = project;
    this.settings.currentIntegration = project.expand?.integrations
      ? project.expand?.integrations[0]
      : null;
    this.saveToStorage(this.settings);
  }

  setCurrentIntegration(integration: z.infer<typeof IntegrationSchema>) {
    if (!this.settings) return;

    this.settings.currentIntegration = integration;
    this.saveToStorage(this.settings);
  }

  private saveToStorage(settings: z.infer<typeof SettingsSchema>) {
    try {
      localStorage.setItem("settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }

  clear() {
    this.settings = null;
    try {
      localStorage.removeItem("settings");
    } catch (error) {
      console.error("Failed to clear settings from localStorage:", error);
    }
  }
}

export const settingsProvider = new SettingsProvider();
