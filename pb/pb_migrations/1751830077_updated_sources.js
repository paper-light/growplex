/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // add field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3332084752",
    "hidden": false,
    "id": "relation2729472648",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "documents",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "webSitemap",
      "webAuto",
      "custom"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // remove field
  collection.fields.removeById("relation2729472648")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "webPages",
      "webSitemap",
      "webAuto",
      "files"
    ]
  }))

  return app.save(collection)
})
