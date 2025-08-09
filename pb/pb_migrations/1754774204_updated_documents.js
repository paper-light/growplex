/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3332084752")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_2uHIS9wAm9` ON `documents` (`source`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3332084752")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
