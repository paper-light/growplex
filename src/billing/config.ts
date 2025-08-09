import type { Model, ModelUsage } from "./types";

const MARKUP = 5;

export const BILLING_GAS_QUOTAS = {
  Free: 1000,
  Lite: 2000,
  Plus: 3500,
  Pro: 9000,
  Business: 55000,
} as const;

export const BILLING_PRICES = {
  Free: 0,
  Lite: 2700,
  Plus: 6700,
  Pro: 9700,
  Business: 49700,
} as const;

const API_CENTS_PER_TOKEN: Record<Model, ModelUsage> = {
  // OPENAI
  "gpt-4.1-mini": {
    in: (0.4 / 1000000) * 100,
    out: (1.6 / 1000000) * 100,
    cache: (0.1 / 1000000) * 100,
  },
  "gpt-4.1-nano": {
    in: (0.1 / 1000000) * 100,
    out: (0.4 / 1000000) * 100,
    cache: (0.025 / 1000000) * 100,
  },
  "gpt-5-nano": {
    cache: (0.005 / 1000000) * 100,
    in: (0.05 / 1000000) * 100,
    out: (0.4 / 1000000) * 100,
  },
  "gpt-5-mini": {
    cache: (0.025 / 1000000) * 100,
    in: (0.025 / 1000000) * 100,
    out: (2 / 1000000) * 100,
  },
  "text-embedding-3-small": {
    in: (0.01 / 1000000) * 100,
    out: 0,
    cache: 0,
  },

  // GEMINI
  "gemini-2.5-flash-lite": {
    in: 0.1 / 1000000,
    out: 0.4 / 1000000,
    cache: 0.1 / 1000000,
  },

  // GOOGLE
  "gemini-2.5-flash": {
    in: 0.3 / 1000000,
    out: 2.5 / 1000000,
    cache: 0.3 / 1000000,
  },
};

export const BILLING_GAS_PRICES_PER_TOKEN: Record<Model, ModelUsage> = (() => {
  const prices = {} as Record<Model, ModelUsage>;
  for (const model of Object.keys(API_CENTS_PER_TOKEN) as Model[]) {
    prices[model] = {
      cache: API_CENTS_PER_TOKEN[model].cache * MARKUP,
      in: API_CENTS_PER_TOKEN[model].in * MARKUP,
      out: API_CENTS_PER_TOKEN[model].out * MARKUP,
    };
  }
  return prices;
})();
