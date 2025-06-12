/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("relation680616395")

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "select3057528519",
    "maxSelect": 1,
    "name": "roles",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "operator",
      "owner"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(10, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3705076665",
    "hidden": false,
    "id": "relation680616395",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "lead",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("select3057528519")

  return app.save(collection)
})
