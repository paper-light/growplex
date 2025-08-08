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

// 5 gas = 0.01$ = 1c of our costs
// Prices for business clients
export const BILLING_GAS_PRICES_PER_TOKEN = {
  "gpt-5-nano": {
    cache: 0.00000000025,
    in: 0.0000000025,
    out: 0.00000002,
  },

  "gpt-5-mini": {
    cache: 0.00000000125,
    in: 0.0000000125,
    out: 0.0000001,
  },

  "text-embedding-3-small": {
    in: 0.0000000005,
    out: 0,
    cache: 0,
  },
};
