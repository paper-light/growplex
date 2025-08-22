/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  e.next();

  $app.runInTransaction((txApp) => {
    const projectId = e.record.get("project");

    const project = txApp.findRecordById("projects", projectId);
    const org = txApp.findRecordById("orgs", project.get("org"));
    const member = txApp.findRecordsByFilter(
      "orgMembers",
      `org = "${org.id}" && role = 'owner'`
    )[0];
    const user = txApp.findRecordsByFilter(
      "users",
      `orgMembers:each = "${member.id}"`
    )[0];

    e.record.set("operators", [user.id]);

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
      txApp.save(e.record);
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

    const chatCollection = txApp.findCollectionByNameOrId("chats");
    const chat = new Record(chatCollection);

    // Inner chat for oracle in context of that integration
    chat.set("project", projectId);
    chat.set("integration", e.record.id);
    chat.set(
      "firstMessage",
      "I am your Marketing Oracle. Let's startup manage your CRM!"
    );
    chat.set("type", "inner");
    txApp.save(chat);

    txApp.save(e.record);
    console.log("Integration record setup complete. Proceeding to next.");
  });
}, "integrations");
