import type { AIMessageChunk } from "@langchain/core/messages";

import { type Model, type ModelUsage, ModelUsageSchema } from "./types";
import { BILLING_GAS_PRICES_PER_TOKEN } from "./config";

export class Usager {
  private usage: Record<Model, ModelUsage>;

  constructor() {
    this.usage = {
      "gpt-5-nano": ModelUsageSchema.parse({}),
      "gpt-5-mini": ModelUsageSchema.parse({}),
      "gpt-4.1-mini": ModelUsageSchema.parse({}),
      "gpt-4.1-nano": ModelUsageSchema.parse({}),
      "text-embedding-3-small": ModelUsageSchema.parse({}),
      "gemini-2.5-flash-lite": ModelUsageSchema.parse({}),
      "gemini-2.5-flash": ModelUsageSchema.parse({}),
    };
  }

  updateMetadataUsage(usage: any, model: Model) {
    const cache = usage.input_token_details.cache_read;
    const input = usage.input_tokens - cache;
    const out = usage.output_tokens;
    this.usage[model].cache += cache;
    this.usage[model].in += input;
    this.usage[model].out += out;
  }

  update(result: AIMessageChunk, model: Model) {
    const cache = result!.usage_metadata?.input_token_details?.cache_read ?? 0;
    const totalInput = result!.usage_metadata?.input_tokens ?? 0;
    const totalOutput = result!.usage_metadata?.output_tokens ?? 0;
    this.usage[model].cache += cache;
    this.usage[model].in += totalInput - cache;
    this.usage[model].out += totalOutput;
  }

  calculatePrice() {
    let price = 0;
    for (const model of Object.keys(this.usage) as Model[]) {
      price +=
        this.usage[model].cache * BILLING_GAS_PRICES_PER_TOKEN[model].cache;
      price += this.usage[model].in * BILLING_GAS_PRICES_PER_TOKEN[model].in;
      price += this.usage[model].out * BILLING_GAS_PRICES_PER_TOKEN[model].out;
    }
    return price;
  }
}
