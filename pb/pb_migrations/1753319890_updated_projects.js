/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "listRule": "(@request.auth.orgMembers.org ?= org) && (org.orgMembers_via_org.role = 'owner' ||  integrations_via_project.operators ?= @request.auth.id)",
    "viewRule": "(@request.auth.orgMembers.org ?= org) && (org.orgMembers_via_org.role = 'owner' ||  integrations_via_project.operators ?= @request.auth.id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "listRule": "(@request.auth.orgMembers.org ?= org) && (org.orgMembers_via_org.role = 'owner' || @request.auth.id ?= integrations_via_project.operators)",
    "viewRule": "(@request.auth.orgMembers.org ?= org) && (org.orgMembers_via_org.role = 'owner' || @request.auth.id ?= integrations_via_project.operators)"
  }, collection)

  return app.save(collection)
})
