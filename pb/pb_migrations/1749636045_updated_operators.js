/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2338068732")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_pbc_2338068732` ON `managers` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_pbc_2338068732` ON `managers` (`email`) WHERE `email` != ''"
    ],
    "name": "managers"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2338068732")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_pbc_2338068732` ON `operators` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_pbc_2338068732` ON `operators` (`email`) WHERE `email` != ''"
    ],
    "name": "operators"
  }, collection)

  return app.save(collection)
})
