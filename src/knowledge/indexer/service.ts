import { fetchSitemapUrls } from "./sitemap";

export async function indexDomain(domain: string) {
  await checkDomainAccessibility(domain);

  const pageUrls = [domain, ...(await fetchSitemapUrls(domain))];
}

async function checkDomainAccessibility(domain: string) {
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
