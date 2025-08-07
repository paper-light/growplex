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
export const BILLING_GAS_PRICES_PER_TOKEN = {
  //
  GPT41Mini: {
    cache: 0.00005, // 0.1$/1M = 0.0000001$/token = 0.00001c/token = 0.00005gas/token
    in: 0.0002, // 0.4$/1M = 0.0000004$/token
    out: 0.0008, // 1.6$/1M = 0.0000016$/token
  },

  GPT41Nano: {
    cache: 0.0000125, // mini / 4
    in: 0.00005, // mini / 4
    out: 0.0002, // mini / 4
  },

  EmbedderSmall: 0.00001, // $0.02/1M
};
