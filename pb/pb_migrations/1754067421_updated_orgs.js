/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3519626785")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3980638064",
    "hidden": false,
    "id": "relation2747688147",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "subscription",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3519626785")

  // remove field
  collection.fields.removeById("relation2747688147")

  return app.save(collection)
})
