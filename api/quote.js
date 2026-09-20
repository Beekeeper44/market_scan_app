// Your own CORS proxy. The browser can't call Yahoo directly; it calls this
// instead, and this runs on a server where the browser's rules don't apply.
//
// Deployed automatically when this folder is dropped on vercel.com/drop —
// the file's location (api/quote.js) is what makes it an endpoint.

const ALLOWED = new Set([
  "query1.finance.yahoo.com",
  "query2.finance.yahoo.com",
  "stooq.com",
]);

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
           "(KHTML, like Gecko) Chrome/125.0 Safari/537.36";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();

  const target = req.query.url;
  if (!target) return res.status(400).send("missing url");

  // Only the data hosts. Without this the endpoint would proxy anything for anyone.
  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return res.status(400).send("bad url");
  }
  if (!ALLOWED.has(parsed.hostname)) return res.status(400).send("host not allowed");

  try {
    const upstream = await fetch(target, {
      headers: { "User-Agent": UA, "Accept": "application/json,text/csv,text/plain" },
    });
    const body = await upstream.text();

    // Cache at the edge for 15 minutes. Daily bars don't change intraday, and this
    // keeps repeat scans from hammering the source.
    res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "text/plain");
    return res.status(upstream.status).send(body);
  } catch (err) {
    return res.status(502).send("upstream failed: " + err.message);
  }
}
