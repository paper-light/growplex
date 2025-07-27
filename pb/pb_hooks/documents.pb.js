/// <reference path="../pb_data/types.d.ts" />

onRecordDelete((e) => {
  $app.runInTransaction((txApp) => {
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
      )}/collections/${collectionName}/points/delete`,
      headers: {
        "Content-Type": "application/json",
        "api-key": $os.getenv("QDRANT_API_KEY"),
      },
      method: "POST",
      body: {
        filter: {
          must: [
            {
              key: "metadata.documentId",
              match: { value: e.record.id },
            },
          ],
        },
      },
    });

    if (res.statusCode != 200) {
      throw new Error("Failed to delete document from Qdrant");
    }
  });

  e.next();
}, "documents");
