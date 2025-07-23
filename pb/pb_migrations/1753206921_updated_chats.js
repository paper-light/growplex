/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // update collection data
  unmarshal({
    "createRule": "",
    "listRule": "@request.auth.orgMembers.org.projects.chats:each ?= id",
    "updateRule": "@request.auth.orgMembers.org.projects.chats:each ?= id",
    "viewRule": "@request.auth.orgMembers.org.projects.chats:each ?= id"
  }, collection)

  return app.save(collection)
})
