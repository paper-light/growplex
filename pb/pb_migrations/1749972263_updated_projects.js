/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org.projects ?= id",
    "viewRule": "@request.auth.orgMembers.org.projects ?= id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org:each.projects.id:length > 0",
    "viewRule": "@request.auth.orgMembers.org:each.projects.id:length > 0"
  }, collection)

  return app.save(collection)
})
