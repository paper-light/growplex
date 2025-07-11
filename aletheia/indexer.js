import { fetchSitemapUrls } from "./sitemap.js";

export async function indexDomain(domain) {
  await checkDomainAccessibility(domain);

  const pageUrls = [domain, ...(await fetchSitemapUrls(domain))];
  return pageUrls;
}

async function checkDomainAccessibility(domain) {
  const url = new URL(domain);
  if (!url.hostname) {
    throw new Error(`Domain ${domain} is not a valid domain`);
  }

  const res = await fetch(`${domain}`, {
    method: "HEAD",
    mode: "no-cors",
  });
  if (!res.ok) {
    throw new Error(`Domain ${domain} is not accessible`);
  }
}
