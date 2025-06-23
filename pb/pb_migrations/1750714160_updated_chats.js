/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.orgMembers.org.projects.chats:each ?= id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // update collection data
  unmarshal({
    "updateRule": null
  }, collection)

  return app.save(collection)
})
