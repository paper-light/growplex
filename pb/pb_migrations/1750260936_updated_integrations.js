/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_733358252")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org.projects.integrations:each ?= id",
    "updateRule": "@request.auth.orgMembers.org.projects.integrations:each ?= id",
    "viewRule": "@request.auth.orgMembers.org.projects.integrations:each ?= id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_733358252")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org.projects:each.integrations ?= id",
    "updateRule": "@request.auth.orgMembers.org.projects:each.integrations ?= id",
    "viewRule": "@request.auth.orgMembers.org.projects:each.integrations ?= id"
  }, collection)

  return app.save(collection)
})
