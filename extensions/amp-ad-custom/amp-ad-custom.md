---
$category@: ads-analytics
formats:
  - ads
teaser:
  text: Alternative way to serve valid AMPHTML ads.
---

# AMP Template Ad Integration Guidelines

## Overview

AMP template ads are an alternative way to serve valid AMPHTML ads without the complexity of serving time validation and signing. The high level idea is to load an ad template that is written in AMP and served from an authorized AMP proxy server, and render the ad client-side with fetched ad data in JSON format from an ad server.

For any ad network to serve AMPHTML template ads, the integration consists of 3 parts:

-   AMPHTML Ad template creation
-   Ad server change: ad serving endpoint
-   Ads tag in AMP

## AMPHTML Ad Template Creation

Ad network creates ad templates in AMP format and hosts them on their own domain similar to canonical AMP pages.

For example, adnetwork.com could host a template at the following URL:
`https://adnetwork.com/amp_template_1.html`
The corresponding AMP proxy URL is:
`https://adnetwork-com.cdn.ampproject.org/ad/s/adnetwork.com/amp_template_1.html.`

The ad network's domain name (origin) serves as a namespace, and the URL path serves as its ID.

The proxy server caches the template on the first request. It follows the same stale-while-revalidate caching policy as normal AMP pages, meaning a syncing request is made in the background after every cache hit.

To make sure the template is valid AMPHTML, ad network must make an HTTP request to the cache URL, which returns a 4XX error, if invalid. This will also warm up the cache, and thereby speed up the first ad load. The cache URL can be converted from the canonical AMP URL following the rule described above (see detailed URL format <a href="https://developers.google.com/amp/cache/overview#amp-cache-url-format">here</a>).

To update a template, an ad network just needs to update the page on their domain, then make another cache warm-up request.

Note: at this stage, domains need to be allowlisted manually in AMP Cache to experiment with the feature.

## Ad server

The ad network needs to provide a new serving endpoint that returns a CORS response in a JSON format:

```js
{
  templateUrl: "https://adexample.com/amp_template_1.html",
  data: {
    clickUrl: "https://buy.com/buy-1",
    buttonText: "Buy now"
  },
  analytics: {
    type: "googleanalytics",
    config: {
      ...
    }
  }
}
```

The response requires a couple of custom headers:

-   custom headers for CORS
-   AMP-Ad-Template-Extension: amp-mustache
-   Amp-Ad-Response-Type: template

## Ads tag

The `amp-ad-custom` extension can be used to quickly declare ad slots, using key-value pairs set on data attributes to form the ad request. An example slot might look like:

```html
<amp-ad-custom
  width="320"
  height="50"
  src="http://www.my-ad-network.com"
  data-request-param-{param_1}="{val_1}"
  data-request-param-{param_2}="{val_2}"
  .
  .
  .
  data-request-param-{param_N}="{val_N}"
>
</amp-ad-custom>
```

And the resultant ad request URL would be: `http://www.my-ad-network.com?{param_1}={val_1}&{param_2}={val_2}&...&{param_N}={val_N}`.
