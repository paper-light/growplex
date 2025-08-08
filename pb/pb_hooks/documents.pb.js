/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  if (!e.record.get("type")) {
    e.record.set("type", "manual");
  }
  if (!e.record.get("status")) {
    e.record.set("status", "idle");
  }
  if (!e.record.get("title")) {
    e.record.set("title", `Document ${e.record.id.slice(0, 4)}`);
  }

  e.next();
}, "documents");

onRecordDelete((e) => {
  if (["indexed", "unsynced"].includes(e.record.get("status"))) {
    // Delete from Qdrant
    const res = $http.send({
      url: `${$os.getenv(
        "QDRANT_URL"
      )}/collections/chunks/points/delete?wait=true`,
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

  e.next();
}, "documents");
