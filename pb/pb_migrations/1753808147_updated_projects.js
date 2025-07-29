/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "viewRule": "(@request.auth.orgMembers.org ?= org)\n&&\n(org.orgMembers_via_org.role = 'owner'\n  || \nintegrations_via_project.operators:each ?= @request.auth.id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "viewRule": "(@request.auth.orgMembers.org ?= org) && (org.orgMembers_via_org.role = 'owner' ||  integrations_via_project.operators:each ?= @request.auth.id)"
  }, collection)

  return app.save(collection)
})
