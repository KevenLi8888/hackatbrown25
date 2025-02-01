const WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php";

export async function searchWikipediaArticle(query: string) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    srsearch: query,
    utf8: "1",
    origin: "*",
  });

  const response = await fetch(`${WIKIPEDIA_API_BASE}?${params}`);
  const data = await response.json();
  return data.query.search;
}

export async function getWikipediaArticle(title: string) {
  const params = new URLSearchParams({
    action: "parse",
    format: "json",
    page: title,
    prop: "text",
    utf8: "1",
    redirects: "true",
    origin: "*",
    mobileformat: "1"
  });

  const response = await fetch(`${WIKIPEDIA_API_BASE}?${params}`);
  const data = await response.json();
  return data.parse;
} 