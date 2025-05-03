import express from "express";
import PocketBase from "pocketbase";
import { handler as astroHandler } from "./dist/server/entry.mjs";

const app = express();

const pbReady = (async () => {
  const pb = new PocketBase(process.env.PUBLIC_PB_URL);
  await pb
    .collection("_superusers")
    .authWithPassword(process.env.PB_ID!, process.env.PB_PASSWORD!);
  return pb;
})();

app.use(express.static("dist/client"));

// import { initBackgroundTasks } from "./src/server/init.js";
// initBackgroundTasks();

app.use("/app/widget", async (req, res, next) => {
  console.log("Request URL:", req.url);
  const pb = await pbReady;
  const match = req.url.match(/^\/([\w-]+)/);
  if (match) {
    const chatId = match[1];
    try {
      const chat = await pb.collection("chats").getOne(chatId);
      const domain = chat.domain;

      if (domain) {
        res.setHeader("Content-Security-Policy", `frame-ancestors ${domain}`);
      } else {
        res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
      }
    } catch (e) {
      res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    }
  }
  next();
});

app.use(astroHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
