/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org.projects.chats:each ?= chat",
    "viewRule": "@request.auth.orgMembers.org.projects.chats:each ?= chat"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
