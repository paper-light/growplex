/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org.projects.agents:each ?= id",
    "viewRule": "@request.auth.orgMembers.org.projects.agents:each ?= id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org.projects:each.agents ?= id",
    "viewRule": "@request.auth.orgMembers.org.projects:each.agents ?= id"
  }, collection)

  return app.save(collection)
})
