/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // update collection data
  unmarshal({
    "createRule": "(@request.auth.orgMembers.org ?= chat.project.org) && (chat.project.org.orgMembers_via_org.role = 'owner')",
    "listRule": "(@request.auth.orgMembers.org ?= chat.project.org) && (chat.project.org.orgMembers_via_org.role = 'owner' || @request.auth.id ?= chat.integration.operators)",
    "updateRule": "(@request.auth.orgMembers.org ?= chat.project.org) && (chat.project.org.orgMembers_via_org.role = 'owner' || @request.auth.id ?= chat.integration.operators)",
    "viewRule": "(@request.auth.orgMembers.org ?= chat.project.org) && (chat.project.org.orgMembers_via_org.role = 'owner' || @request.auth.id ?= chat.integration.operators)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
