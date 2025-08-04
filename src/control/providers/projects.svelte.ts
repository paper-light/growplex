import { pb } from "@/shared/lib/pb";
import { settingsProvider } from "@/user/settings.svelte";
import type { ProjectsResponse } from "@/shared/models/pocketbase-types";

class ProjectsProvider {
  private subscribed = false;

  projects: ProjectsResponse[] = $state([]);

  selectedProject = $derived.by(() => {
    if (this.projects.length == 0) return null;

    if (settingsProvider.selectedProjectId) {
      const found = this.projects.find(
        (r) => r.id === settingsProvider.selectedProjectId
      );
      if (found) return found;
    }

    return this.projects[0];
  });

  // SUBSCRIPTIONS
  async load(orgId: string) {
    const projects = await pb.collection("projects").getFullList({
      filter: `org = "${orgId}"`,
      sort: "created",
    });
    this.projects = projects;
  }

  async subscribe(orgId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    await this.load(orgId);

    pb.collection("projects").subscribe(
      "*",
      async (project) => {
        console.log("project", project);
        switch (project.action) {
          case "create":
            this.projects.push(project.record);
            break;
          case "delete":
            this.projects = this.projects.filter(
              (r) => r.id !== project.record.id
            );
            break;
          case "update":
            this.projects = this.projects.map((r) =>
              r.id === project.record.id ? project.record : r
            );
            break;
          default:
            break;
        }
      },
      {
        filter: `org = "${orgId}"`,
        sort: "created",
      }
    );
  }

  unsubscribe() {
    pb.collection("projects").unsubscribe();
    this.subscribed = false;
  }
}

export const projectsProvider = new ProjectsProvider();
