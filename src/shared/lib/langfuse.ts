import { CallbackHandler } from "langfuse-langchain";

import { getEnv } from "../helpers/get-env";

const PUBLIC_KEY = getEnv("PUBLIC_LANGFUSE_PUBLIC_KEY");
const SECRET_KEY = getEnv("LANGFUSE_SECRET_KEY");

export const langfuseHandler = new CallbackHandler({
  publicKey: PUBLIC_KEY,
  secretKey: SECRET_KEY,
  baseUrl: "https://cloud.langfuse.com",
});

// await chain.invoke(
//   { input: "<user_input>" },
//   { callbacks: [langfuseHandler] }
// );
