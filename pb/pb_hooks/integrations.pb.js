/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  e.next();

  $app.runInTransaction((txApp) => {
    const projectId = e.record.get("project");
    const agents = e.record.get("agents");
    const chats = txApp.findRecordsByFilter(
      "chats",
      `integration = "${e.record.id}"`
    );

    if (!e.record.get("name"))
      e.record.set("name", `Integration ${e.record.id.slice(0, 4)}`);

    if (agents.length === 0) {
      console.log("No agent found for integration, creating default agent...");

      const collection = txApp.findCollectionByNameOrId("agents");
      const agent = new Record(collection);
      agent.set("project", projectId);
      txApp.save(agent);

      console.log("Created agent with id:", agent.id);

      e.record.set("agents", [agent.id]);
    }

    if (chats.length === 0) {
      console.log("No chat found for integration, creating default chat...");
      const collection = txApp.findCollectionByNameOrId("chats");
      const chat = new Record(collection);

      chat.set("project", projectId);
      chat.set("integration", e.record.id);
      txApp.save(chat);

      e.record.set("chats", [chat.id]);
    }

    txApp.save(e.record);
    console.log("Integration record setup complete. Proceeding to next.");
  });
}, "integrations");
