import { encoding_for_model } from "tiktoken";

export type TiktokenModel =
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "text-embedding-3-small";

const encoderCache = new Map<TiktokenModel, any>();

export const encoderService = {
  countTokens(text: string, model: TiktokenModel): number {
    if (!encoderCache.has(model)) {
      encoderCache.set(model, encoding_for_model(model));
    }
    const encoder = encoderCache.get(model);
    return encoder.encode(text).length;
  },
};
