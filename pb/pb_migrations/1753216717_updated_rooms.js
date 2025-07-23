/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // update collection data
  unmarshal({
    "updateRule": "(\n  @request.auth.orgMembers.org ?= chat.project.org\n)\n  &&\n(\n  chat.project.org.orgMembers_via_org.role = 'owner'\n  ||\n  @request.auth.id ?= chat.integration.operators\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // update collection data
  unmarshal({
    "updateRule": "(\n  @request.auth.orgMembers.org ?= chat.project.org\n)\n&&\n(\n  chat.project.org.orgMembers_via_org.role = 'owner'\n)"
  }, collection)

  return app.save(collection)
})
