---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Implements subscription-style access protocol for Subscribe with Google.
---

<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

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

Where `data` matches the [entitlements response](https://github.com/subscriptions-project/swg-js/blob/master/docs/entitlements-flow.md#entitlement-response) format.

Additionally, if `subscribe.google.com` returns an entitlement, and `hasAssociatedAccountUrl` and
`accountCreationRedirectUrl` are set, the [deferred account creation flow](https://github.com/subscriptions-project/swg-js/blob/d1d3b9278a9776ee8b3f7409eb5b01233fdf24cc/docs/deferred-account-flow.md)
will be initiated.

First, the `accountCreationRedirectUrl` will receive a POST request with the following payload:
```
{ 
  entitlements: ... //
}
```

where the data in entitlements is a JSON representation of the value in the entitlement pingback.

The return body should contain the following payload:

```
{ found: boolean }
```

where found indicates whether an account associated with the given entitlement was found on the publisher side.

If the account was found, the user will be asked
whether they want to create an account on the publisher side to associate with 
the google subscription service. In the positive case, the user will then be redirected
to the URL at `accountCreationRedirectUrl`.

The page at `accountCreationRedirectUrl` should then take care of implementing the 
[deferred account creation flow](https://github.com/subscriptions-project/swg-js/blob/d1d3b9278a9776ee8b3f7409eb5b01233fdf24cc/docs/deferred-account-flow.md)
on their side to complete the association. Because the confirmation was already given on the AMP
side, the page can skip requesting the user pemission again.

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
          "serviceId": "subscribe.google.com",
          "hasAssociatedAccountUrl": "https://...",
          "accountCreationRedirectUrl": "https://...",
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
