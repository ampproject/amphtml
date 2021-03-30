# Iframe origin policy

Various AMP features allow loading iframes from arbitrary origins into AMP pages. Examples are the [`amp-iframe`](../extensions/amp-iframe/amp-iframe.md) element and [the custom domain feature of `amp-ad`](../extensions/amp-ad/amp-ad.md#running-ads-from-a-custom-domain). The origin of a URL such as `https://example.com/some/path` is `https://example.com`. See [the HTML5 spec](https://www.w3.org/TR/2011/WD-html5-20110525/origin-0.html#origin) for details.

These iframes are typically allowed to execute arbitrary JavaScript, but for security reasons they are never allowed to access the AMP document itself using any method besides sending messages via postMessage.

AMP documents are designed to be accessible both through the web servers and origins where they are hosted and AMP proxy caches (such as cdn.ampproject.org). In the latter case, the iframes would never be on the same origin as the document, because iframes cannot be hosted on the proxy cache. This enforces the security rule from above.

In the case where iframe and document are hosted by the same party the rule is much less relevant, because the cross iframe access would happen exclusively between HTML pages owned by the same party. Having said that, AMP wants to ensure that AMP documents behave the same whether they are served through a proxy or served from the origin domain. If iframe and document were on the same origin in the latter case, one could accidentally write code that relies on them being on the same origin. Such documents would then break when hosted on the cache. To ensure that direct JavaScript access between AMP document and iframe is never possible, AMP thus enforces that they are not on the same origin. There is one exception to this. `amp-iframe` uses a restrictive [iframe-sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox) by default. If one does not opt into `allow-same-origin`, then every origin is allowed for the iframe. As soon as you add `allow-same-origin` to the sandbox the origin rules apply.

In concrete terms this means: If your main site is hosted on `www.example.com`, then you cannot include an iframe from `www.example.com`. Every other origin such as `iframe.example.com` or `assets.example.com` is fine.

## Security impact

The above only enforces that documents do not rely on cross-frame access for functionality. There is no guarantee that iframes are never on the same origin as the origin an AMP document is hosted on. One can easily circumvent AMP's not-same-origin-enforcement through redirects, since only the initial URL is tested.
