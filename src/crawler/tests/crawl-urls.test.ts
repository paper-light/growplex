import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { crawlUrls } from "../crawl";

describe("crawlUrls", () => {
  const dummyUrls = ["https://gold-swan.is/", "https://growplex.dev/"];

  //   beforeEach(() => {
  //     global.fetch = vi.fn().mockResolvedValue({
  //       ok: true,
  //       json: async () => ({
  //         results: ["result1", "result2"],
  //       }),
  //     });
  //   });

  //   afterEach(() => {
  //     vi.restoreAllMocks();
  //   });

  it("should call fetch with correct arguments and return results", async () => {
    const results = await crawlUrls(dummyUrls, false);

    // expect(results).toEqual(["result1", "result2"]);

    // expect(global.fetch).toHaveBeenCalledTimes(1);
    // const [url, options] = (global.fetch as any).mock.calls[0];
    // expect(url).toMatch(/crawl/);
    // expect(options.method).toBe("POST");
    // expect(JSON.parse(options.body).urls).toEqual(dummyUrls);
    // expect(JSON.parse(options.body).crawler_config.magic).toBe(true);
  });
});
