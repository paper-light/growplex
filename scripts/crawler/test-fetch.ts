// test-fetch.js

// If you’re on Node <18, uncomment the next line and run `npm install node-fetch`
// import fetch from 'node-fetch';

(async () => {
  const url =
    "https://elins-svarka.ru/regulyator-rashoda-kedr-u-30-ar-40-2-s-2-rotametrami.html";

  try {
    const res = await fetch(url, {
      method: "GET",
      // Spoof a real browser UA
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/115.0.0.0 Safari/537.36",
      },
      // follow redirects
      redirect: "follow",
    });

    console.log("HTTP Status:", res.status);
    console.log("Final URL:", res.url);
    console.log("Content-Type:", res.headers.get("content-type"));

    const body = await res.text();
    console.log("\n=== First 500 characters of response ===\n");
    console.log(body.slice(0, 500).replace(/\s+/g, " "), "…");
  } catch (err) {
    console.error("Fetch failed:", err);
  }
})();
