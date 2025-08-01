/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // remove field
  collection.fields.removeById("relation2509679470")

  // remove field
  collection.fields.removeById("relation3387985825")

  // remove field
  collection.fields.removeById("relation761796623")

  // remove field
  collection.fields.removeById("relation1168167679")

  // remove field
  collection.fields.removeById("relation2083417258")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3681818456",
    "hidden": false,
    "id": "relation2509679470",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "agents",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2250675308",
    "hidden": false,
    "id": "relation3387985825",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "sources",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3861817060",
    "hidden": false,
    "id": "relation761796623",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "chats",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1168167679",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "operators",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_733358252",
    "hidden": false,
    "id": "relation2083417258",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "integrations",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
