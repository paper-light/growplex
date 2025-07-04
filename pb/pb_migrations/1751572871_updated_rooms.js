/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.orgMembers.org.projects.chats:each ?= chat && (status=\"seeded\" || status=\"preview\")",
    "deleteRule": "@request.auth.orgMembers.org.projects.chats:each ?= chat && (status=\"preview\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.orgMembers.org.projects.chats:each ?= chat",
    "deleteRule": null
  }, collection)

  return app.save(collection)
})
