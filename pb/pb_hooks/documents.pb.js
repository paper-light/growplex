/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  if (!e.record.get("type")) {
    e.record.set("type", "manual");
  }
  if (!e.record.get("status")) {
    e.record.set("status", "loaded");
  }

  e.next();
}, "documents");

onRecordDelete((e) => {
  $app.runInTransaction((txApp) => {
    if (e.record.get("status") == "indexed") {
      // Get the organization ID from the document's source
      const sourceId = JSON.parse(e.record.get("metadata")).sourceId;
      const source = txApp.findRecordById("sources", sourceId);
      if (!source) throw new Error("Source not found for document");

      const project = txApp.findRecordById("projects", source.get("project"));
      if (!project) throw new Error("Project not found for source");

      const org = txApp.findRecordById("orgs", project.get("org"));
      if (!org) throw new Error("Organization not found for project");

      // Delete from Qdrant
      const collectionName = `org_${org.id}`;
      const res = $http.send({
        url: `${$os.getenv(
          "QDRANT_URL"
        )}/collections/${collectionName}/points/delete?wait=true`,
        headers: {
          "Content-Type": "application/json",
          "api-key": $os.getenv("QDRANT_API_KEY"),
        },
        method: "POST",
        body: JSON.stringify({
          filter: {
            must: [
              {
                key: "metadata.documentId",
                match: { value: e.record.id },
              },
            ],
          },
        }),
      });

      if (res.statusCode !== 200) {
        throw new Error("Failed to delete document from Qdrant");
      }
    }
  });

  e.next();
}, "documents");
