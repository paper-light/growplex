/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update collection data
  unmarshal({
    "createRule": "(\n  @request.auth.orgMembers.org ?= room.chat.project.org\n)\n  &&\n(\n  room.chat.project.org.orgMembers_via_org.role = 'owner'\n  ||\n  @request.auth.id ?= room.chat.integration.operators\n)",
    "listRule": "(\n  @request.auth.orgMembers.org ?= room.chat.project.org\n)\n  &&\n(\n  room.chat.project.org.orgMembers_via_org.role = 'owner'\n  ||\n  @request.auth.id ?= room.chat.integration.operators\n)",
    "viewRule": "(\n  @request.auth.orgMembers.org ?= room.chat.project.org\n)\n  &&\n(\n  room.chat.project.org.orgMembers_via_org.role = 'owner'\n  ||\n  @request.auth.id ?= room.chat.integration.operators\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
