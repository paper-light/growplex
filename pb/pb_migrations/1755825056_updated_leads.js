/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3705076665")

  // update collection data
  unmarshal({
    "listRule": "(@request.auth.orgMembers.org ?= project.org) && (project.org.orgMembers_via_org.role = 'owner')",
    "updateRule": "(@request.auth.orgMembers.org ?= project.org) && (project.org.orgMembers_via_org.role = 'owner')",
    "viewRule": "(@request.auth.orgMembers.org ?= project.org) && (project.org.orgMembers_via_org.role = 'owner')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3705076665")

  // update collection data
  unmarshal({
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
