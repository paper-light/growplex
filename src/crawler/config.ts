export const MAX_DEPTH = 5;
export const MAX_URLS_PER_SITEMAP = 10000;
export const MAX_TOTAL_URLS = 50000;
export const REQUEST_TIMEOUT = 10 * 1000;
export const MAX_SITEMAP_SIZE = 10 * 1024 * 1024;

export const BROWSER_CONFIG = {
  type: "BrowserConfig",
  params: {
    headless: true,
  },
};

export const DEEP_CRAWL_STRATEGY = {
  type: "BFSDeepCrawlStrategy",
  params: {
    max_pages: 500,
    max_depth: 4,
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

export const MARKDOWN_GENERATOR = {
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
};

export const CRAWLER_CONFIG_PARAMS = {
  type: "CrawlerRunConfig",
  wait_for: "css:body",
};
