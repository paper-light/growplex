/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3332084752")

  // update collection data
  unmarshal({
    "createRule": "(@request.auth.orgMembers.org ?= source.project.org) && (source.project.org.orgMembers_via_org.role = 'owner')",
    "deleteRule": "(@request.auth.orgMembers.org ?= source.project.org) && (source.project.org.orgMembers_via_org.role = 'owner')",
    "listRule": "(@request.auth.orgMembers.org ?= source.project.org) && (source.project.org.orgMembers_via_org.role = 'owner')",
    "updateRule": "(@request.auth.orgMembers.org ?= source.project.org) && (source.project.org.orgMembers_via_org.role = 'owner')",
    "viewRule": "(@request.auth.orgMembers.org ?= source.project.org) && (source.project.org.orgMembers_via_org.role = 'owner')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3332084752")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
