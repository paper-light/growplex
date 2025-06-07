/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // remove field
  collection.fields.removeById("select3616895705")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select3616895705",
    "maxSelect": 1,
    "name": "model",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "low",
      "mid",
      "high"
    ]
  }))

  return app.save(collection)
})
