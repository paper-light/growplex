/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // remove field
  collection.fields.removeById("select1001261735")

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1001261735",
    "max": 0,
    "min": 0,
    "name": "event",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // add field
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

  // remove field
  collection.fields.removeById("text1001261735")

  return app.save(collection)
})
