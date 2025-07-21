export * from "./assistant";

// import { ChatAnthropic } from "@langchain/anthropic";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// const GOOGLE_API_KEY = getEnv("GOOGLE_API_KEY");
// const ANTHROPIC_API_KEY = getEnv("ANTHROPIC_API_KEY");

// const googleModel = new ChatGoogleGenerativeAI({
//   model: "gemini-2.5-flash-preview-05-20",
//   temperature: 1,
//   maxOutputTokens: MAX_TOKENS,
//   apiKey: GOOGLE_API_KEY,
// });

// const anthropicModel = new ChatAnthropic({
//   model: "claude-3-haiku-20240307",
//   temperature: 1,
//   maxTokens: MAX_TOKENS,
//   apiKey: ANTHROPIC_API_KEY,
// });

// const selectModel = (
//   provider: "openai" | "anthropic" | "google" | "deepseek"
// ) => {
//   switch (provider) {
//     case "openai":
//       return openaiModel;
//     case "anthropic":
//       return anthropicModel;
//     case "google":
//       return googleModel;
//     case "deepseek":
//       return openaiModel;
//   }
// };

// export const getChain = (
//   provider: "openai" | "anthropic" | "google" | "deepseek"
// ) => {
//   const llm = selectModel(provider);
//   return mainPrompt.pipe(llm);
// };
