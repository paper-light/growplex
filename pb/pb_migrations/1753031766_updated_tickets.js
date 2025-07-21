/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3306545694")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select1655102503",
    "maxSelect": 1,
    "name": "priority",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "low",
      "high",
      "medium"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3306545694")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select1655102503",
    "maxSelect": 1,
    "name": "priority",
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
