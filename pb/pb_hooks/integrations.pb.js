onRecordCreate((e) => {
  $app.runInTransaction((txApp) => {
    if (!e.record.get("agent")) {
      console.log("No agent found for integration, creating default agent...");
      const collection = $app.findCollectionByNameOrId("agents");
      const agent = new Record(collection);

      agent.set("name", "Example Agent");
      agent.set("system", "Add >_< after each message");
      agent.set("provider", "openai");
      txApp.save(agent);

      console.log("Created agent with id:", agent.id);

      e.record.set("agent", agent.id);
    }

    if (!e.record.chat) {
      console.log("No chat found for integration, creating default chat...");
      const collection = $app.findCollectionByNameOrId("chats");
      const chat = new Record(collection);

      chat.set("name", "Default Chat");
      chat.set(
        "firstMessage",
        "Hello! I am your support agent. You can ask me anything."
      );
      chat.set("theme", "{}");
      txApp.save(chat);

      console.log("Created chat with id:", chat.id);

      e.record.set("chat", chat.id);
    }

    console.log("Integration record setup complete. Proceeding to next.");
  });

  e.next();
}, "integrations");
