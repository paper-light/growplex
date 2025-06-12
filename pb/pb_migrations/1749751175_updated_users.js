/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
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
      "orgOperator",
      "operator"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
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
})
