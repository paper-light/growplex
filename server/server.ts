import express from "express";
import { handler as astroHandler } from "../dist/server/entry.mjs";
import { pbReady } from "./pb";

const app = express();

app.use("/app/widgets/chat/:chatId", async (req, res, next) => {
  const { chatId } = req.params;
  const pb = await pbReady;

  try {
    const chat = await pb.collection("chats").getOne(chatId);
    const allowedDomain = chat.domain;

    if (allowedDomain) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors ${allowedDomain}`
      );
    } else {
      res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    }
  } catch (err) {
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
  }

  next();
});

app.use(express.static("dist/client"));

// import { initBackgroundTasks } from "./src/server/init.js";
// initBackgroundTasks();

app.use(astroHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
