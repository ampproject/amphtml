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

Implements subscription-style access protocol for Subscribe with Google.

<table>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Beta.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>
      <code>
        &lt;script async custom-element="amp-subscriptions-google"
        src="https://cdn.ampproject.org/v0/amp-subscriptions-google-0.1.js">&lt;/script>
      </code>
    </td>
  </tr>
  <tr>
    <td class="col-fourty">
      <strong>
        <a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">
          Supported Layouts
        </a>
      </strong>
    </td>
    <td>N/A</td>
  </tr>
</table>

[TOC]

## Introduction

The `amp-subscriptions-google` is the extension that enables Subscribe with Google in an AMP page.

See [amp-subscriptions](../amp-subscriptions/amp-subscriptions.md) for more details on AMP Subscriptions.

See [Subscribe with Google GitHub repo](https://github.com/subscriptions-project/swg-js) for details on the project itself.


## Configuration

The `amp-subscriptions-google` is configured as part of `amp-subscriptions` configuration.

```
<head>
  ...
  <script async custom-element="amp-subscriptions"
  src="https://cdn.ampproject.org/v0/amp-subscriptions-0.1.js"></script>
  <script async custom-element="amp-subscriptions-google"
  src="https://cdn.ampproject.org/v0/amp-subscriptions-google-0.1.js"></script>
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
As described in [amp-subscriptions](../amp-subscriptions/amp-subscriptions.md#pingback-endpoint), if a `pingbackUrl` is specified by the local service, the entitlements response returned by the "winning" service will be sent to the  `pingbackUrl` via a POST request.

If `subscribe.google.com` is the "winning" service, the request to the `pingbackUrl` will be of the following format:
```
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

## Example with markup
```
<head>
  ...
  <script async custom-element="amp-subscriptions"
  src="https://cdn.ampproject.org/v0/amp-subscriptions-0.1.js"></script>
  <script async custom-element="amp-subscriptions-google"
  src="https://cdn.ampproject.org/v0/amp-subscriptions-google-0.1.js"></script>
  <script type="application/json" id="amp-subscriptions">
  {
    "services": [
      {
         // Local service configuration
        "authorizationUrl": "https://...",
        "pingbackUrl": "https://...",
        "actions":{
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
