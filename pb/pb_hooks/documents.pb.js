/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  if (e.record.get("previewContent").length > 5000) {
    e.record.set(
      "previewContent",
      e.record.get("previewContent").slice(0, 4997) + "..."
    );
  }

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

onRecordUpdate((e) => {
  if (e.record.get("previewContent").length > 5000) {
    e.record.set(
      "previewContent",
      e.record.get("previewContent").slice(0, 4997) + "..."
    );
  }
  e.next();
}, "documents");

onRecordDelete((e) => {
  const meili = require(`${__hooks}/lib/meili.js`);

  if (["indexed", "unsynced"].includes(e.record.get("status"))) {
    console.log("Deleting from Meili");
    meili.meiliService.deleteByDocumentId(e.record.id);
  }

  e.next();
}, "documents");
