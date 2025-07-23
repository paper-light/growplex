/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_733358252")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3681818456",
    "hidden": false,
    "id": "relation646683805",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "agents",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3861817060",
    "hidden": false,
    "id": "relation1704850090",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "chats",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_733358252")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3681818456",
    "hidden": false,
    "id": "relation646683805",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "agent",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3861817060",
    "hidden": false,
    "id": "relation1704850090",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "chat",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
