/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select1001261735",
    "maxSelect": 1,
    "name": "event",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "operatorConnected",
      "operatorDisconnected",
      "message",
      "updateLead",
      "createTicket",
      "callOperator",
      "callSearchChain"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select1001261735",
    "maxSelect": 1,
    "name": "event",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "operatorConnected",
      "operatorDisconnected",
      "message",
      "updateLead",
      "createTicket",
      "callOperator"
    ]
  }))

  return app.save(collection)
})
