/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3306545694")

  // remove field
  collection.fields.removeById("number1655102503")

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3306545694")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number1655102503",
    "max": null,
    "min": null,
    "name": "priority",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // remove field
  collection.fields.removeById("select1655102503")

  return app.save(collection)
})
