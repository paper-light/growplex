onRecordCreate((e) => {
  $app.runInTransaction((txApp) => {
    if (e.record.get("integrations").length === 0) {
      console.log("No integrations found, creating default integration...");

      // Integration
      const col = txApp.findCollectionByNameOrId("integrations");
      const integration = new Record(col);
      integration.set("name", "Default Integration");
      txApp.save(integration);

      // Project
      e.record.set("agents+", [integration.get("agent")]);
      e.record.set("chats+", [integration.get("chat")]);
      e.record.set("integrations+", [integration.id]);
    }
  });

  e.next();
}, "projects");

onRecordUpdate((e) => {
  $app.runInTransaction((txApp) => {
    console.log("Updating project with id:", e.record.id);

    const agentIds = e.record.get("agents");
    const chatIds = e.record.get("chats");
    const integrationIds = e.record.get("integrations");

    console.log("integrationIds:", integrationIds);
    const integrations = txApp.findRecordsByIds("integrations", integrationIds);
    console.log("integrations:", integrations);
    const integrationAgentIds = integrations.map((integration) =>
      integration.get("agent")
    );
    const integrationChatIds = integrations.map((integration) =>
      integration.get("chat")
    );

    const newAgentIds = integrationAgentIds.filter(
      (id) => !agentIds.includes(id)
    );
    const newChatIds = integrationChatIds.filter((id) => !chatIds.includes(id));

    if (newAgentIds.length > 0) e.record.set("agents+", newAgentIds);
    if (newChatIds.length > 0) e.record.set("chats+", newChatIds);
  });

  e.next();
}, "projects");
