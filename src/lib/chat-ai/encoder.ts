import { encoding_for_model } from "tiktoken";

export type TiktokenModel =
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "text-embedding-3-small";

export class GlobalEncoderService {
  private static instance: GlobalEncoderService;
  private encoders = new Map<TiktokenModel, any>();

  private constructor() {}

  static getInstance(): GlobalEncoderService {
    if (!GlobalEncoderService.instance) {
      GlobalEncoderService.instance = new GlobalEncoderService();
    }
    return GlobalEncoderService.instance;
  }

  getEncoder(model: TiktokenModel): any {
    if (!this.encoders.has(model)) {
      this.encoders.set(model, encoding_for_model(model));
    }
    return this.encoders.get(model);
  }

  countTokens(text: string, model: TiktokenModel): number {
    const encoder = this.getEncoder(model);
    return encoder.encode(text).length;
  }

  countTokensForTexts(texts: string[], model: TiktokenModel): number[] {
    const encoder = this.getEncoder(model);
    return texts.map((text) => encoder.encode(text).length);
  }

  getTotalTokenCount(texts: string[], model: TiktokenModel): number {
    const encoder = this.getEncoder(model);
    return texts.reduce(
      (total, text) => total + encoder.encode(text).length,
      0
    );
  }

  checkTokenLimit(
    text: string,
    model: TiktokenModel,
    maxTokens?: number
  ): {
    tokenCount: number;
    exceedsLimit: boolean;
    remainingTokens: number;
    modelLimit: number;
  } {
    const tokenCount = this.countTokens(text, model);
    const modelLimit = this.getModelTokenLimit(model);
    const limit = maxTokens || modelLimit;

    return {
      tokenCount,
      exceedsLimit: tokenCount > limit,
      remainingTokens: Math.max(0, limit - tokenCount),
      modelLimit,
    };
  }

  getModelTokenLimit(model: TiktokenModel): number {
    const limits = {
      "gpt-4": 8192,
      "gpt-3.5-turbo": 4096,
      "text-embedding-3-small": 8192,
    };
    return limits[model];
  }

  dispose(): void {
    for (const encoder of this.encoders.values()) {
      if (encoder && typeof encoder.free === "function") {
        encoder.free();
      }
    }
    this.encoders.clear();
  }

  disposeEncoder(model: TiktokenModel): void {
    const encoder = this.encoders.get(model);
    if (encoder && typeof encoder.free === "function") {
      encoder.free();
    }
    this.encoders.delete(model);
  }
}

export const globalEncoderService = GlobalEncoderService.getInstance();

export const encoderUtils = {
  countEmbeddingTokens: (text: string): number =>
    globalEncoderService.countTokens(text, "text-embedding-3-small"),

  countGPT4Tokens: (text: string): number =>
    globalEncoderService.countTokens(text, "gpt-4"),

  countGPT35Tokens: (text: string): number =>
    globalEncoderService.countTokens(text, "gpt-3.5-turbo"),

  needsEmbeddingChunking: (text: string, maxTokens: number = 8000): boolean => {
    return (
      globalEncoderService.countTokens(text, "text-embedding-3-small") >
      maxTokens
    );
  },

  needsGPT4Chunking: (text: string, maxTokens: number = 8000): boolean => {
    return globalEncoderService.countTokens(text, "gpt-4") > maxTokens;
  },

  getTokenCountForStorage: (text: string): number =>
    globalEncoderService.countTokens(text, "text-embedding-3-small"),
};
