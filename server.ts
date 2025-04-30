import express from "express";
import { handler as astroHandler } from "./dist/server/entry.mjs";

const app = express();

app.use(express.static("dist/client"));

// import { initBackgroundTasks } from "./src/server/init.js";
// initBackgroundTasks();

app.use(astroHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
