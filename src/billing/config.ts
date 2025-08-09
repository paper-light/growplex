export const BILLING_LIMITS = {
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

// Clients buy 1 cent per 1 gas
// 10 gas = 0.01$ = 1c of our costs
// Margin is 10/11 = 90.9%

// Prices for business clients
export const BILLING_GAS_PRICES_PER_TOKEN = {
  // OPENAI
  "gpt-5-nano": {
    cache: 0.000000005,
    in: 0.00000005,
    out: 0.00000004,
  },
  "gpt-5-mini": {
    cache: 0.0000000025,
    in: 0.000000025,
    out: 0.0000002,
  },
  "text-embedding-3-small": {
    in: 0.000000001,
    out: 0,
    cache: 0,
  },

  // GEMINI
  
};
