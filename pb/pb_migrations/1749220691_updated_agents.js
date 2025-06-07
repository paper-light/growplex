/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2726680096",
    "hidden": false,
    "id": "relation1153946136",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "llm",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // remove field
  collection.fields.removeById("relation1153946136")

  return app.save(collection)
})
