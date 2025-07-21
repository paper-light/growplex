/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_WAW0Ok6ko8` ON `chats` (\n  `domain`,\n  `tg`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
