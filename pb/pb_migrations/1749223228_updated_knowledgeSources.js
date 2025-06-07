/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "date3644943765",
    "max": "",
    "min": "",
    "name": "indexed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number3097355333",
    "max": null,
    "min": null,
    "name": "frequencyDays",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // remove field
  collection.fields.removeById("date3644943765")

  // remove field
  collection.fields.removeById("number3097355333")

  return app.save(collection)
})
