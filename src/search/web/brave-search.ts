import { getEnv } from "@/shared/helpers/get-env";
import { logger } from "@/shared/lib/logger";

const BRAVE_SEARCH_URL = getEnv("BRAVE_SEARCH_URL");
const BRAVE_SEARCH_API_KEY = getEnv("BRAVE_SEARCH_API_KEY");

const log = logger.child({
  module: "search:web:brave-search",
});

export class BraveSearch {
  private readonly apiKey: string;
  private readonly url: string;

  constructor(url: string, apiKey: string) {
    this.apiKey = apiKey;
    this.url = url;
  }

  async search(query: string) {
    const params = new URLSearchParams({
      q: query,
    });
    const response = await fetch(`${this.url}?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": this.apiKey,
      },
    });

    if (!response.ok) {
      log.error({ response }, "Failed to search");
      throw new Error(`Failed to search: ${response.statusText}`);
    }

    const data = await response.json();
    log.debug({ data }, "Search results");

    return data.web.results;
  }
}

export const braveSearch = new BraveSearch(
  BRAVE_SEARCH_URL,
  BRAVE_SEARCH_API_KEY
);
