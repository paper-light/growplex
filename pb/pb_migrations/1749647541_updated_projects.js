/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
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
    "name": "knowledgeSources",
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

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // remove field
  collection.fields.removeById("relation2509679470")

  // remove field
  collection.fields.removeById("relation3387985825")

  // remove field
  collection.fields.removeById("relation761796623")

  return app.save(collection)
})
