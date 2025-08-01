/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3519626785")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "bool1438057950",
    "name": "earlyAdopter",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3519626785")

  // remove field
  collection.fields.removeById("bool1438057950")

  return app.save(collection)
})
