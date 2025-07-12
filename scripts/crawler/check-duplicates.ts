// check-duplicates.js
import fs from "fs";
import path from "path";
import crypto from "crypto";

const dataDir = path.resolve("data");
const hashes = new Map();

for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"))) {
  const { markdown } = JSON.parse(
    fs.readFileSync(path.join(dataDir, file), "utf8")
  );
  const hash = crypto.createHash("sha1").update(markdown.trim()).digest("hex");
  if (!hashes.has(hash)) hashes.set(hash, []);
  hashes.get(hash).push(file);
}

for (const [hash, files] of hashes) {
  if (files.length > 1) {
    console.log(
      `✖ ${files.length} files share the same content:`,
      files.slice(0, 5).join(", ")
    );
  } else {
    console.log(`✔ unique: ${files[0]}`);
  }
}
