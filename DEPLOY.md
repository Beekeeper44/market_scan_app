# Deploying this

Drop this whole folder on **vercel.com/drop**. That's it — the URL it gives you is live
and public, and `api/quote.js` becomes an endpoint automatically because of where the
file sits.

```
site/
  index.html      the scanner
  api/quote.js    your CORS proxy
```

Then open the URL on your phone, Share → Add to Home Screen.

## Does CORS work once it's public?

Yes, and better than it does as a local file.

The rule that blocks the page is the browser's, not Yahoo's: a page at one origin can't
read a response from another origin unless that other origin grants permission, and
Yahoo doesn't. Hosting changes nothing about that. What gets around it is a server in
the middle — servers aren't bound by the rule — which fetches the data and hands it back
with `Access-Control-Allow-Origin: *`.

`api/quote.js` is that server. Once deployed:

- Same-origin requests. The page calls `/api/quote`, which is its own origin, so there's
  no cross-site question at all.
- No third-party dependency. Public relays throttle, break, and vanish. Yours doesn't.
- Edge caching. Responses cache for 15 minutes, so repeat scans are fast and the sources
  see a fraction of the traffic.
- A host allowlist. It only proxies Yahoo and Stooq, so nobody can point your endpoint at
  something else.

If the function isn't there — you opened the file locally, or dropped it on a static-only
host — the page notices on the first request and switches to public relays by itself. The
line under the progress bar tells you which one it's using.

## Where it won't work

A Claude artifact link. Artifacts run under a policy that blocks outbound requests to
everything but a few script CDNs, so the Scan button would do nothing. It needs a normal
host: Vercel, Netlify, GitHub Pages, or your own.

## Anyone with the URL can use it

There are no keys in the page and none in the function, so a public URL leaks nothing.
But the proxy is open — anyone who finds it can pull Yahoo data through your Vercel
project. It's free-tier traffic on two harmless endpoints. If that bothers you, add a
shared secret to the query string and check it in the function.
