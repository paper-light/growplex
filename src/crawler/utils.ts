import { REQUEST_TIMEOUT } from "./config";
import {
  createRateLimiter,
  rateLimitWait,
} from "../shared/helpers/rate-limite";

export const crawlerRateLimiter = createRateLimiter({
  keyPrefix: "crawler_rl",
  points: 1,
  duration: 1,
});

export function validateDomain(domain: string): string {
  if (!domain || typeof domain !== "string") {
    throw new Error("Domain must be a non-empty string");
  }

  let normalizedDomain = domain.trim();

  if (
    !normalizedDomain.startsWith("http://") &&
    !normalizedDomain.startsWith("https://")
  ) {
    normalizedDomain = `https://${normalizedDomain}`;
  }

  try {
    new URL(normalizedDomain);
    return normalizedDomain;
  } catch {
    throw new Error(`Invalid domain format: ${domain}`);
  }
}

export async function safeFetch(
  url: string,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Growplex-Sitemap-Parser/1.0",
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`Request timeout for ${url}`);
    } else {
      console.warn(`Failed to fetch ${url}:`, error);
    }
    return null;
  }
}

export async function rateLimitRequest(identifier: string): Promise<void> {
  await rateLimitWait(crawlerRateLimiter, identifier, 1, 5000);
}
