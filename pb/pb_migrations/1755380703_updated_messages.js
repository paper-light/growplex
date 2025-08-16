/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update collection data
  unmarshal({
    "deleteRule": "(\n  @request.auth.orgMembers.org ?= room.chat.project.org\n)\n  &&\n(\n  room.chat.project.org.orgMembers_via_org.role = 'owner'\n  ||\n  (\n    @request.auth.id ?= room.chat.integration.operators \n      && \n    room.type = 'chatPreview'\n  )\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update collection data
  unmarshal({
    "deleteRule": null
  }, collection)

  return app.save(collection)
})
