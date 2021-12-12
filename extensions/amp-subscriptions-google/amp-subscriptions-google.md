---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Implements subscription-style access protocol for Subscribe with Google.
---

# amp-subscriptions-google

## Introduction

The `amp-subscriptions-google` is the extension that enables Subscribe with Google in an AMP page.

See [amp-subscriptions](../amp-subscriptions/amp-subscriptions.md) for more details on AMP Subscriptions.

See [Subscribe with Google GitHub repo](https://github.com/subscriptions-project/swg-js) for details on the project itself.

## Configuration

The `amp-subscriptions-google` is configured as part of `amp-subscriptions` configuration.

```html
<head>
  ...
  <script
    async
    custom-element="amp-subscriptions"
    src="https://cdn.ampproject.org/v0/amp-subscriptions-0.1.js"
  ></script>
  <script
    async
    custom-element="amp-subscriptions-google"
    src="https://cdn.ampproject.org/v0/amp-subscriptions-google-0.1.js"
  ></script>
  <script type="application/json" id="amp-subscriptions">
    {
      "services": [
        {
          // Local service configuration
        },
        {
          "serviceId": "subscribe.google.com"
        }
      ]
    }
  </script>
</head>
```

## Real Time Config (rtc)

Real Time Config allows the publisher to specify the sku or sku's for a subscribe button at page load time. The allows user specific offers, time limited offers etc.

To enable rtc add a `skuMapUrl` to the `subscribe.google.com` service.

```html
<script type="application/json" id="amp-subscriptions">
  {
    "services": [
      {
        // Local service configuration
      },
      {
        "serviceId": "subscribe.google.com"
        "skuMapUrl": "https://example.com/sky/map/endpoint"
      }
    ]
  }
</script>
```

The `skuMapUrl` is called on page load. It should be a map of element id's and configurations:

```JSON
{
  "subscribe.google.com": {
    // button that goes straight to purchase flow
    "elementId": {
      "sku": "sku"
     },
    // button that launches an offer carousel
    "anotherElementId": {
      "carouselOptions": {
          "skus": ["basic", "premium_monthly"],
      }
    }
  }
}
```

Each configuration corresponds to the sku or skus associated with the button.

To enable a button for rtc add the `subscriptions-google-rtc` attribute. If this attribute is present the button will be disabled until the skuMapUrl request is completed. Once the skuMap is resolved the `subscriptions-google-rtc` attribute will be removed and `subscriptions-google-rtc-set` attribute added. These attributes may be used for CSS styling, however it is recommended that the button not be hidden if it will cause a page re-layout when displayed.

Note: The `skuMapUrl` can be the same as the local service auth url as the JSON objects do not conflict. If the auth url is cacheable (`max-age=1` is sufficient) this will allow in a single request to the server to resove authentication and mapping.

## Entitlements pingback

As described in [amp-subscriptions](../amp-subscriptions/amp-subscriptions.md#pingback-endpoint), if a `pingbackUrl` is specified by the local service, the entitlements response returned by the "winning" service will be sent to the `pingbackUrl` via a POST request.

If `subscribe.google.com` is the "winning" service, the request to the `pingbackUrl` will be of the following format:

```json
{
  "raw":"...",
  "source":"google",
  "service":"subscribe.google.com",
  "granted":true,
  "grantReason":"SUBSCRIBER",
  "data":{
    "source":"google",
    "products":[ ... ],
    "subscriptionToken":"..."
  }
}
```

Where `data` matches the [entitlements response](https://github.com/subscriptions-project/swg-js/blob/main/docs/entitlements-flow.md#entitlement-response) format.

## Example with markup

```html
<head>
  ...
  <script
    async
    custom-element="amp-subscriptions"
    src="https://cdn.ampproject.org/v0/amp-subscriptions-0.1.js"
  ></script>
  <script
    async
    custom-element="amp-subscriptions-google"
    src="https://cdn.ampproject.org/v0/amp-subscriptions-google-0.1.js"
  ></script>
  <script type="application/json" id="amp-subscriptions">
    {
      "services": [
        {
          // Local service configuration
          "authorizationUrl": "https://...",
          "pingbackUrl": "https://...",
          "actions": {
            "login": "https://...",
            "subscribe": "https://..."
          }
        },
        {
          "serviceId": "subscribe.google.com"
        }
      ]
    }
  </script>
  <script type="application/ld+json">
    {
      "@context": "http://schema.org",
      "@type": "NewsArticle",
      {...},
      "isAccessibleForFree": "False",
      "publisher": {
        "@type": "Organization",
        "name": "The Norcal Tribune",
        "logo": {...}
      },
      "hasPart": {
        "@type": "WebPageElement",
        "isAccessibleForFree": "False",
        "cssSelector" : ".paywall"
      },
      "isPartOf": {
        "@type": ["CreativeWork", "Product"],
        "name" : "The Norcal Tribune",
        "productID": "norcal_tribune.com:basic"
      }
    }
  </script>
</head>
```
