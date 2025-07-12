import { Agent } from "undici";

export const MAX_DEPTH = 5;
export const MAX_URLS_PER_SITEMAP = 10000;
export const MAX_TOTAL_URLS = 50000;
export const REQUEST_TIMEOUT = 10 * 1000;
export const MAX_SITEMAP_SIZE = 10 * 1024 * 1024;

export const undiciAgent = new Agent({
  connectTimeout: 60 * 60 * 1000,
  headersTimeout: 60 * 60 * 1000,
  bodyTimeout: 0,
});

export function buildCrawlerConfig(
  stealth: boolean,
  cache: boolean,
  stream: boolean,
  recursive: boolean,
  maxPages: number = 1000,
  maxDepth: number = 5
) {
  const config: any = {
    type: "CrawlerRunConfig",
    wait_for: "css:body",

    cache_mode: cache ? "enabled" : "disabled",
    stream,

    magic: stealth,
    simulate_user: stealth,
    override_navigator: stealth,

    markdown_generator: {
      type: "DefaultMarkdownGenerator",
      params: {
        content_filter: {
          type: "PruningContentFilter",
          params: {
            threshold: 0.05,
            threshold_type: "fixed",
            min_word_threshold: 2,
          },
        },
      },
    },
  };

  if (recursive) {
    config.deep_crawl_strategy = {
      type: "BFSDeepCrawlStrategy",
      params: {
        max_pages: maxPages,
        max_depth: maxDepth,
        include_external: false,

        filter_chain: {
          type: "FilterChain",
          params: {
            filters: [
              {
                type: "URLPatternFilter",
                params: {
                  patterns: ["*/??/*", "*/??-??/*", "*/??", "*/??-??"],
                  reverse: true,
                },
              },
            ],
          },
        },
      },
    };
  }

  return config;
}

export const buildBrowserConfig = (userAgent = "default") => {
  return {
    type: "BrowserConfig",
    params: {
      headless: true,
      user_agent: userAgent,
    },
  };
};

export const keywordScorer = {
  keywords: [
    "features",
    "benefits",
    "capabilities",
    "pricing",
    "demo",
    "trial",

    "getting-started",
    "tutorial",
    "guide",
    "quickstart",
    "step-by-step",

    "api",
    "integration",
    "sdk",
    "developer",
    "docs",
    "reference",

    "case-study",
    "testimonial",
    "success-story",
    "whitepaper",
    "ebook",

    "faq",
    "help",
    "support",
    "knowledge-base",
    "community",
    "forum",

    "blog",
    "release-notes",
    "news",
    "announcements",
  ],
  weight: 0.7,
};
