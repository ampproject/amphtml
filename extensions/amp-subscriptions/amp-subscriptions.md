---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Implements subscription-style access protocol.
---

# amp-subscriptions

## Usage

The `amp-subscriptions` component implements subscription-style access/paywall rules.

### How it works

1. The AMP Page is loaded in the AMP viewer with some sections obscured using [attributes][11].
2. The AMP Runtime calls the [Authorization endpoint][3] of all configured services.
    1. If all services fail to respond, the [fallback entitlement][8] will be used.
3. The AMP Runtime uses the response to either hide or show different sections as defined by the [Attributes][11].
4. After the document has been shown to the Reader, AMP Runtime calls the Pingback endpoint that can be used by the Publisher to update the countdown meter (number of free views used).
5. The Publisher can place specific [Actions][12] in the AMP document in order to:
    1. Launch their own [Login page][4] to authenticate the Reader and associate the Reader’s identity in their system with the [AMP Reader ID][1]
    2. Launch their own [Subscribe page][5] to allow the Reader to purchase a new subscription
    3. Launch login or subscribe actions from [Vendor Services][7].

### Relationship to `amp-access`

The `amp-subscriptions` component is similar to [`amp-access`](../amp-access/amp-access.md)
and in many features builds on top of `amp-access`. However, it's a much more
specialized version of access/paywall protocol. Some of the key differences are:

1. The `amp-subscriptions` [authorization endpoint](#authorization-endpoint) is similar to the
   [`amp-access` authorization endpoint](../amp-access/amp-access.md#authorization-endpoint) but its response is strictly defined and standardized.
2. Instead of using `amp-access-hide` and `amp-access` attributes as described in [`amp-access` Access Content Markup](../amp-access/amp-access.md#access-content-markup), you'll need to use:
    - [`subscription-section`](#subscriptions-section) to define sections of content for subscribers and non-subscribers.
    - [`subscription-display`](#subscriptions-display) to display elements based on factors that are **not** related to the subscription that the user has.
3. The `amp-subscriptions` component allows multiple [vendor services](#vendor-services) to be configured
   for the page to participate in access/paywall decisions. Services are executed
   concurrently and prioritized based on which service returns the positive response.
4. AMP viewers are allowed to provide `amp-subscriptions` a signed authorization
   response based on an independent agreement with publishers as a proof of access.

Because of standardization of markup, support for multiple providers, and improved viewer
support it is recommended that new publisher and paywall provider implementations
use `amp-subscriptions`.

### AMP Reader ID

To assist access services and use cases, AMP Access introduced the concept of _Reader ID_.

The Reader ID provides a solution for Publishers to identify Readers without revealing any personal information. This allows Publishers to track article views and implement metering, paywalls and other subscription services.

The Reader ID is an anonymous and unique ID created by the AMP ecosystem. It is unique for each Reader/Publisher pair - a Reader is identified differently to two different Publishers. It is a non-reversible ID. It is intended to be random in nature and uses a number of factors to achieve that unpredictability. The Reader ID is included in all AMP/Publisher communications and can be used by Publishers to identify the Reader and map it to their own identity systems.

The Reader ID is constructed on the user device and intended to be long-lived. However, it follows the normal browser storage rules, including those for incognito windows. The intended lifecycle of a Reader ID is 1 year between uses or until the user clears their cookies. The Reader IDs are not currently shared between devices.

The Reader ID is constructed similarly to the mechanism used to build ExternalCID described [here](https://docs.google.com/document/d/1f7z3X2GM_ASb3ZCI_7tngglxwS6WoWi1EB3aKzdf6vo/edit#heading=h.hb9q0wpwwhuf). An example Reader ID is `amp-OFsqR4pPKynymPyMmplPNMvxSTsNQob3TnK-oE3nwVT0clORaZ1rkeEz8xej-vV6`.

We strongly recommend the usage of Reader ID over cookies to identify Readers, as publisher cookies are considered third party cookies when AMP is loaded from CDN and might be blocked by browsers. If you however want to rely on the cookie in cases where it is available, make sure to mark the cookies correctly as [cross-origin cookies](https://web.dev/samesite-cookies-explained/).

### Configuration

The `amp-subscriptions` component must be configured using JSON configuration:

<table>
  <tr>
    <th>Property</th>
    <th>Values</th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><code>services</code></td>
    <td>&lt;array&gt; of &lt;object&gt;</td>
    <td>This <code>array</code> must include:<ul><li>One <a href="#local-service">Local Service</a></li><li>Zero or more <a href="#vendor-services">Vendor Services</a>.</li></ul></td>
  </tr>
  <tr>
    <td class="col-fourty"><code>score</code></td>
    <td>&lt;object&gt;</td>
    <td>Determines which service is selected if no valid entitlements are returned.<br/>See <a href="#service-score-factors">Service Score Factors</a> for more details.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>fallbackEntitlement</code></td>
    <td>&lt;object&gt;</td>
    <td>Determines what level of access the Reader should have if all services fail to respond to the Authorization requests.<br/>See <a href="#fallback-entitlement">Fallback Entitlement</a> for more details.</td>
  </tr>
</table>

Below is an example of a configuration:

```html
<script type="application/json" id="amp-subscriptions">
  {
    "services": [
      {
        // Local service (required)
        "authorizationUrl": "https://pub.com/amp-authorisation?rid=READER_ID&url=SOURCE_URL",
        "pingbackUrl": "https://pub.com/amp-pingback?rid=READER_ID&url=SOURCE_URL",
        "actions": {
          "login": "https://pub.com/amp-login?rid=READER_ID&url=SOURCE_URL",
          "subscribe": "https://pub.com/amp-subscribe?rid=READER_ID&url=SOURCE_URL"
        }
      },
      {
        // Vendor services (optional)
        "serviceId": "service.vendor.com"
      }
    ],
    "score": {
      "supportsViewer": 10,
      "isReadyToPay": 9
    },
    "fallbackEntitlement": {
      "source": "fallback",
      "granted": true,
      "grantReason": "SUBSCRIBER",
      "data": {
        "isLoggedIn": false
      }
    }
  }
</script>
```

### Local service

The local service is provided by the Publisher to control and monitor access to documents.

It is configured using the following properties:

<table>
  <tr>
    <th>Property</th>
    <th>Values</th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><code>type</code></td>
    <td>"remote" or "iframe"</td>
    <td>Default is "remote". The <a href="#iframe-mode">"iframe" mode</a> allows for messaging to be communicated to a publisher-provided iframe, instead through CORS requests to publisher provided endpoints.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>authorizationUrl</code></td>
    <td>&lt;URL&gt;</td>
    <td>The HTTPS URL for the <a href="#authorization-endpoint">Authorization Endpoint</a>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>pingbackUrl</code></td>
    <td>&lt;URL&gt;</td>
    <td>(Optional) The HTTPS URL for the <a href="#pingback-endpoint">Pingback Endpoint</a>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>pingbackAllEntitlements</code></td>
    <td>&lt;boolean&gt;</td>
    <td>(Optional) Whether to send entitlements from all services to the <a href="#pingback-endpoint">Pingback Endpoint</a> or not.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>actions.login</code></td>
    <td>&lt;URL&gt;</td>
    <td>The HTTPS URL for the <a href="#login-page">Login page</a>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>actions.subscribe</code></td>
    <td>&lt;URL&gt;</td>
    <td>The HTTPS URL for the <a href="#subscribe-page">Subscribe page</a>.</td>
  </tr>
</table>

_&lt;URL&gt;_ values specify HTTPS URLs with substitution variables. The substitution variables are covered in more detail in the [URL Variables][13] section below.

Below is an example of a "local" service configuration:

```html
<script type="application/json" id="amp-subscriptions">
  {
    "services": [
      {
        "authorizationUrl": "https://pub.com/amp-authorisation?rid=READER_ID&url=SOURCE_URL",
        "pingbackUrl": "https://pub.com/amp-pingback?rid=READER_ID&url=SOURCE_URL",
        "pingbackAllEntitlements": true,
        "actions":{
          "login": "https://pub.com/amp-login?rid=READER_ID&url=SOURCE_URL",
          "subscribe": "https://pub.com/amp-subscribe?rid=READER_ID&url=SOURCE_URL"
        }
      },
      ...
    ]
  }
</script>
```

#### URL variables

When configuring the URLs for various endpoints, the Publisher can use substitution variables. The full list of these variables are defined in the [HTML URL Variable Substitutions](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-var-substitutions.md).

[`amp-access`](../amp-access/amp-access.md) added the following subscriptions-specific variables:

<table>
  <tr>
    <th>Var</th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-thirty"><code>READER_ID</code></td>
    <td>The AMP Reader ID.</td>
  </tr>
  <tr>
    <td class="col-thirty"><code>AUTHDATA(field)</code></td>
    <td>Available to Pingback and Login URLs. It allows passing any field in the authorization response as an URL parameter. For example, <code>AUTHDATA(data.isLoggedIn)</code></td>
  </tr>
  <tr>
    <td class="col-thirty"><code>RETURN_URL</code></td>
    <td>The placeholder for the return URL specified by the AMP runtime for a Login Dialog to return to.</td>
  </tr>
</table>

In addition to those, the following standard URL substitutions are useful in the context of this component:

<table>
  <tr>
    <td class="col-thirty"><code>SOURCE_URL</code></td>
    <td>The Source URL of this AMP document. If the document is served from a CDN, the AMPDOC_URL will be a CDN URL, while SOURCE_URL will be the original source URL.</td>
  </tr>
  <tr>
    <td class="col-thirty"><code>AMPDOC_URL</code></td>
    <td>The URL of this AMP document.</td>
  </tr>
  <tr>
    <td class="col-thirty"><code>CANONICAL_URL</code></td>
    <td>The canonical URL of this AMP document.</td>
  </tr>
  <tr>
    <td class="col-thirty"><code>DOCUMENT_REFERRER</code></td>
    <td>The Referrer URL.</td>
  </tr>
  <tr>
    <td class="col-thirty"><code>VIEWER</code></td>
    <td>The URL of the AMP Viewer.</td>
  </tr>
  <tr>
    <td class="col-thirty"><code>RANDOM</code></td>
    <td>A random number. Helpful to avoid browser caching.</td>
  </tr>
</table>

Below is an example of the URL extended with Reader ID, Canonical URL, Referrer information and random cache-buster:

```http
https://pub.com/amp-authorization?
   rid=READER_ID
  &url=CANONICAL_URL
  &ref=DOCUMENT_REFERRER
  &_=RANDOM
```

#### Authorization endpoint

Authorization is an endpoint provided by the Publisher and called by the AMP Runtime. It is a credentialed CORS GET endpoint.

The Authorization endpoint must implement the security protocol described in
[CORS security in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests#cors-security-in-amp).

The authorization endpoint returns the Entitlements object that can be used by the [Attributes][11] to hide or show different parts of the document. Authorization endpoint is specified using the "authorizationUrl" property in the config.

The Entitlement response returned by the authorization endpoint must conform to the predefined specification:

<table>
  <tr>
    <th>Property</th>
    <th>Values</th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><code>granted</code></td>
    <td>&lt;boolean&gt;</td>
    <td>Stating whether or not the Reader has access to the document or not.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>grantReason</code></td>
    <td>&lt;string&gt;</td>
    <td>The reason for giving the access to the document, recognized reasons are: <ul><li><code>"SUBSCRIBER"</code> meaning the user is fully subscribed.</li><li><code>"METERING"</code> meaning user is on metering.</li></ul></td>
  </tr>
  <tr>
    <td class="col-fourty"><code>data</code></td>
    <td>&lt;object&gt;</td>
    <td>Free-form data which can be used for template rendering, e.g. messaging related to metering or article count. See <a href="#using-scores-to-customise-content">Customising Content</a> for more details.</td>
  </tr>
</table>

Below is an example response for a Reader who is a subscriber and is logged into their account:

```js
{
  "granted": true,
  "grantReason": "SUBSCRIBER",
  "data" : {
    "isLoggedIn": true
  }
}
```

Below is an example response for an anonymous Reader who has read 4 out of 5 free articles:

```js
{
  "granted": true,
  "grantReason": "METERING",
  "data" : {
    "isLoggedIn": false,
    "articlesRead": 4,
    "articlesLeft": 1,
    "articleLimit": 5
  }
}
```

Below is an example response for an anonymous Reader who does not have access because they have read 5 out of 5 free articles:

```js
{
  "granted": false,
  "data" : {
    "isLoggedIn": false,
    "articlesRead": 5,
    "articlesLeft": 0,
    "articleLimit": 5
  }
}
```

All vendor services must implement authorization endpoint of their own and conform to the amp-subscriptions [response format][3].

#### Login page

The login page allows the Publisher to authenticate the Reader and connect their identity with AMP Reader ID. The login page will open as a result of a `"login"` action as described in the [Actions][12] section.

Below is an example of a login page URL:

```json
{
  "actions": {
    "login": "https://pub.com/amp-login?rid=READER_ID&url=SOURCE_URL",
    ...
  }
}
```

The URL can take any parameters as defined in the [URL Variables][13] section.

#### Subscribe page

The subscribe page allows the Reader to purchase a subscription from the Publisher. The subscribe page will open as a result of a `"subscribe"` action as described in the [Actions][12] section.

An example of a subscribe page URL:

```json
{
  "actions": {
    "subscribe": "https://pub.com/amp-subscribe?rid=READER_ID&url=SOURCE_URL",
    ...
  }
}
```

The URL can take any parameters as defined in the [URL Variables][13] section.

#### Pingback endpoint

Pingback is an endpoint provided by in the "local" service configuration and called by the AMP Runtime. It is a credentialed CORS POST endpoint.

**Note:** The Pingback endpoint must implement the security protocol described in the
[CORS security in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests#cors-security-in-amp).

AMP Runtime calls this endpoint automatically when the Reader has started viewing the document. One of the main goals of the Pingback is for the Publisher to update metering information.

Example request:

```json
{
  "service": "local",
  "granted": true,
  "grantReason": "METERING",
  "data": {
    "isLoggedIn": false,
    "articlesRead": 2,
    "articlesLeft": 3,
    "articleLimit": 5
  }
}
```

Pingback is optional. It's only enabled when the "pingbackUrl" property is specified.

By default, as the body, pingback POST request receives the entitlement object returned by the "winning" authorization endpoint. However if the config for the "local" service contains `pingbackAllEntitlements: true` the body will contain an array of all the entitlments received, from all services, including those which do not grant access.

**Important:** The pingback JSON object is sent with `Content-type: text/plain`. This is intentional as it removes the need for a CORS preflight check.

#### Combining the AMP Reader ID with Publisher cookies

To accurately identify the Reader, the Publisher should associate the [AMP Reader ID][1] with any Publisher cookies relevant to the Reader.

<amp-img alt="reader id cookie association" layout="responsive" width="1195" height="1148" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-subscriptions/images/reader-id-assoociation.png">
  <noscript>
    <img alt="reader id cookie association" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-subscriptions/images/reader-id-assoociation.png">
  </noscript>
</amp-img>

**Note:** due to the way that the [AMP Reader ID][1] is created, there may be multiple [AMP Reader IDs][1] for the same the user across different devices and browsers so the Publisher must take care to handle that appropriately.

#### "iframe" mode

In the "iframe" mode authorization and pingback are provided by messaging to a publisher supplied iframe instead of the CORS requests to the specified authorization and pingback endpoints.

In iframe mode the `authorzationUrl` and `pingbackUrl` are deleted
and replaced by:

-   "iframeSrc" - publisher supplied iframe
-   "iframeVars - AMP variables to be sent to the iframe
-   "type" - must be "iframe"

The "local" service is configured in "iframe" mode as follows:

```html
<script type="application/json" id="amp-subscriptions">
  {
    "services": [
      {
        "type": "iframe",
        "iframeSrc": "https://...",
        "iframeVars": [
          "READER_ID",
          "CANONICAL_URL",
          "AMPDOC_URL",
          "SOURCE_URL",
          "DOCUMENT_REFERRER"
        ],
        "actions":{
          "login": "https://...",
          "subscribe": "https://..."
        }
      },
      ...
    ]
  }
</script>
```

The properties in the "local" service are (remote mode):

-   "type" - optional type, defaults to "remote"
-   "authorizationUrl" - the authorization endpoint URL.
-   "pingbackUrl" - the pingback endpoint URL.
-   "actions" - a named map of action URLs. At a minimum there must be two actions specified: "login" and "subscribe".

In iframe mode the `authorizationUrl` and `pingbackUrl` are deleted
and replaced by:

-   "iframeSrc" - publisher supplied iframe
-   "iframeVars - AMP variables to be sent to the iframe
-   "type" - must be "iframe"

See [amp-access-iframe](../amp-access/0.1/iframe-api/README.md) for details of the messaging protocol.

### Vendor services

The vendor service configuration must reference the `serviceId` and can contain any additional properties allowed by the vendor service.

```html
<script type="application/json" id="amp-subscriptions">
  {
    "services": [
      {
        // Local service definition
      },
      {
        "serviceId": "service.vendor.com"
      }
    ]
  }
</script>
```

See the vendor service's documentation for details.

#### Available vendor services

-   [amp-subscriptions-google](../amp-subscriptions-google/amp-subscriptions-google.md)

### Service score factors

If no service returns an entitlement that grants access, all services are compared by calculating a score for each and the highest scoring service is selected. Each service has a `"baseScore"` (default 0). A value < 100 in the `baseScore` key in any service configuration represents the initial score for that service. If no `baseScore` is specified it defaults to `0`.

The score is calculated by taking the `baseScore` for the service and adding dynamically calculated weights from `score[factorName]` configuration multiplied by the value returned by each service for that `factorName`. Services may return a value between [-1..1] for factors they support. If a service is not aware of a factor or does not support it `0` will be returned.

If publisher wishes to ignore a score factor they may either explicitly set its value to `0` or omit it from the `score` map.

Available scoring factors:

1. `supportsViewer` returns `1` when a service can cooperate with the current AMP viewer environment for this page view.
1. `isReadyToPay` returns `1` when the user is known to the service and the service has a form of payment on file allowing a purchase without entering payment details.

All scoring factors have default value of `0`. In the event of a tie the local service wins.

**Note:** If you would like to test the behavior of a document in the context of a particular viewer, you can add `#viewerUrl=` fragment parameter. For instance, `#viewerUrl=https://www.google.com` would emulate the behavior of a document inside a Google viewer.

### Fallback entitlement

If all configured services fail to get the entitlements, the entitlement configured under `fallbackEntitlement` section will be used as a fallback entitlement for `local` service. The document is unblocked based on this fallback entitlement.

Example fallback entitlement:

```json
{
  "fallbackEntitlement": {
    "source": "fallback",
    "granted": true,
    "grantReason": "SUBSCRIBER",
    "data": {
      "isLoggedIn": false
    }
  }
}
```

### Structured data markup

`amp-subscriptions` relies on the Schema.org page-level configuration for two main properties:

1.  The product ID that the user must be granted to view the content: `productID`.
2.  Whether this content requires this product at this time: `isAccessibleForFree`.

A usable configuration will provide `NewsArticle` typed item with `isAccessibleForFree` property and a subitem of type `Product` that specifies the `productID`. The configuration is resolved as soon as `productID` and `isAccessibleForFree` are found. It is, therefore, advised to place the configuration as high up in the DOM tree as possible.

The JSON-LD and Microdata formats are supported.

More detail on the markup is available [here](https://developers.google.com/search/docs/data-types/paywalled-content).

#### Example

In these examples:

1.  The product ID is "norcal_tribune.com:basic" (`"productID": "norcal_tribune.com:basic"`).
2.  This document is currently locked (`"isAccessibleForFree": false`).

Below is an example of the markup using JSON-LD:

```html
<script type="application/ld+json">
  {
    "@context": "http://schema.org",
    "@type": "NewsArticle",
    "isAccessibleForFree": false,
    "publisher": {
      "@type": "Organization",
      "name": "The Norcal Tribune"
    },
    "hasPart": {...},
    "isPartOf": {
      "@type": ["CreativeWork", "Product"],
      "name" : "The Norcal Tribune",
      "productID": "norcal_tribune.com:basic"
    }
  }
</script>
```

Below is an example of the markup using Microdata:

```html
<div itemscope itemtype="http://schema.org/NewsArticle">
  <meta itemprop="isAccessibleForFree" content="false" />
  <div
    itemprop="isPartOf"
    itemscope
    itemtype="http://schema.org/CreativeWork http://schema.org/Product"
  >
    <meta itemprop="name" content="The Norcal Tribune" />
    <meta itemprop="productID" content="norcal_tribute.com:basic" />
  </div>
</div>
```

## Attributes

### `subscription-action`

In order to present the Reader with specific experiences, the Publisher provides specific actions which are declared in the "actions" configuration and can be marked up using `subscriptions-action` attribute.

Available values:

-   `login`: this will trigger the [Login page][4] of the selected service.
-   `subscribe`: this will trigger the [Subscribe page][5] of the selected service.

For example, this button will execute the "subscribe" action:

```html
<button subscriptions-action="subscribe" subscriptions-display="EXPR">
  Subscribe now
</button>
```

By default, the actions are hidden and must be explicitly shown using the `subscriptions-display` expression.

### `subscription-service`

In the markup the actions can be delegated to other services for them to execute the actions. This can be achieved by specifying `subscriptions-service` attribute.

Available values:

-   `local`: this will force the `local` service to be used for a particular action.
-   `{serviceId}` (e.g. `subscribe.google.com`): this will force the service with ID `serviceId` to be used for a particular action.

For example, this button will surface the subscribe page from the `subscribe.google.com` service, regardless of the [service score factors][9]:

```html
<button
  subscriptions-action="subscribe"
  subscriptions-service="subscribe.google.com"
>
  Subscribe
</button>
```

### `subscription-decorate`

In addition to delegation of the action to another service, you can also ask another service to decorate the element. Just add the attribute `subsciptions-decorate` to get the element decorated.

```html
<button
  subscriptions-decorate
  subscriptions-action="subscribe"
  subscriptions-service="subscribe.google.com"
>
  Subscribe
</button>
```

### `subscriptions-section`

The premium sections are shown/hidden automatically based on the authorization/entitlements response.

Available values:

-   `content`: this is used to encapsulate the premium content.
-   `content-not-granted`: this is used to will force the `local` service to be used for a particular action.

For instance, you should include the premium article contents in the `content` section and any fallback content in the `content-not-granted` section:

```html
<!-- Include non-subscriber's content in here -->
<section subscriptions-section="content-not-granted">
  You are not allowed to currently view this content.
</section>

<!-- Include subscriber's content in here -->
<section subscriptions-section="content">
  This content will be hidden unless the reader is authorized.
</section>
```

**Important:** Do not apply `subscriptions-section="content"` to the whole page. Doing so may cause a visible flash when content is later displayed, and may prevent your page from being indexed by search engines. We recommend that the content in the first viewport be allowed to render regardless of subscription state.

### `subscriptions-display`

As well as showing/hiding premium and fallback content, there are more ways to customise the document using the `subscriptions-display` attribute which uses expressions for actions and dialogs. The value of `subscriptions-display` is a boolean expression defined in a SQL-like language. The grammar is defined in [amp-access Appendix A](../amp-access/amp-access.md#appendix-a-amp-access-expression-grammar).

Values in the `data` object of an Entitlements response can be used to build expressions. In this example the value of `isLoggedIn` is in the `data` object and is used to conditionally show UI for login and upgrading your account:

```html
<section>
  <button
    subscriptions-action="login"
    subscriptions-display="NOT data.isLoggedIn"
  >
    Login
  </button>
  <div subscriptions-actions subscriptions-display="data.isLoggedIn">
    <div>My Account</div>
    <div>Sign out</div>
  </div>
  <div
    subscriptions-actions
    subscriptions-display="data.isLoggedIn AND NOT grantReason = 'SUBSCRIBER'"
  >
    <a href="...">Upgrade your account</a>
  </div>
</section>
```

**Important:** Do not use `data` for granting/denying access to content, conditional display of content based on user access, or displaying user or account related information.

#### Using scores to customise content

The score factors returned by each configured service can be used to control the display of content within dialogs. For example `factors['subscribe.google.com'].isReadyToPay` would be the "ready to pay" score factor from the `subscribe.google.com` service (also known as `amp-subscriptions-google`). Similarly `factors['local'].isReadyToPay` would be for the local service and `scores['subscribe.google.com'].supportsViewer` would be the score factor for the Google service supporting the current viewer.

Sample usage:

```html
<!-- Shows a Subscribe with Google button if the user is ready to pay -->
<button
  subscriptions-display="factors['subscribe.google.com'].isReadyToPay"
  subscriptions-action="subscribe"
  subscriptions-service="subscribe.google.com"
  subscriptions-decorate
>
  Subscribe with Google
</button>
```

#### `subscriptions-dialog`

The paywall dialogs are shown automatically based on the authorization/entitlements response.

A dialog is marked up using the `subscriptions-dialog` and `subscriptions-display` attributes:

```html
<div subscriptions-dialog subscriptions-display="EXPR">
  This content will be shown as a dialog when "subscription-display" expression
  matches.
</div>
```

The element on which `subscriptions-dialog` dialog is specified can also be a `<template>` element in which case it will be initially rendered before being displayed as a dialog. For instance:

```html
<template type="amp-mustache" subscriptions-dialog subscriptions-display="NOT granted">
  <!-- Customise the experience for the user using the `data` object returned in the authorization response -->
  <!-- Do NOT use the `data` object to show or hide premium content as this is not always returned -->
  {{^data.articlesRead}}
  <p>
    You have read all of your free articles!
  </p>
  {{/data.articlesRead}}
  {{#data.articlesRead}}
  <p>
    You have read <b>{{data.articlesRead}}</b> articles.
  </p>
  {{/data.articlesRead}}
  {{#data.articlesLeft}}
  <p>
    You have <b>{{data.articlesLeft}}</b> free articles left!
  </p>
  {{/data.articlesLeft}}
  <button subscriptions-action="subscribe" subscriptions-service="local" subscriptions-display="true">
    Subscribe
  </button>
  <section subscriptions-display="NOT granted AND NOT data.isLoggedIn">
  <button
    subscriptions-action="login"
    subscriptions-service="local"
    subscriptions-display="NOT granted AND NOT data.isLoggedIn">
    Already subscribed?
  </button>

</template>
```

The first dialog with matching `subscriptions-display` is shown.

## Actions

Actions are provided in the `"local"` service configuration in the `"actions"` property. It is a named set of action. Any number of actions can be configured this way, but two actions are required: `"login"` and `"subscribe"`.

All actions work the same way: the popup window is opened for the specified URL. The page opened in the popup window can perform the target action, such as login/subscribe/etc, and it is expected to return by redirecting to the URL specified by the `"return"` query parameter.

Notice, while not explicitly visible, any vendor service can also implement its own actions. Or it can delegate to the `"login"` service to execute `"login"` or `"subscribe"` action.

Example action configuration:

```js
"actions":{
  "login": "https://pub.com/amp-login?rid=READER_ID&url=SOURCE_URL",
  "subscribe": "https://pub.com/amp-subscribe?rid=READER_ID&url=SOURCE_URL"
}
```

### `login`

The `login` action flow is as follows:

1. A request is made to the specified URL of the following format:
    ```http
    https://pub.com/amp-login?
      rid=READER_ID
      &url=SOURCE_URL
      &return=RETURN_URL
    ```
    **Note:** the “return” URL parameter is added by the AMP Runtime automatically if `RETURN_URL` substitution is not specified.
2. The Login page will be opened as a normal web page with no special constraints, other than it should function well as a [browser dialog](https://developer.mozilla.org/en-US/docs/Web/API/Window/open).
3. Once the Publisher has authenticated the Reader, the Publisher should associate the Publisher cookies with the [AMP Reader ID][1] as described in the [Combining the AMP Reader ID with Publisher Cookies][14] section.
4. Once the Login page completes its work, it must redirect back to the specified “Return URL” with the following format:
    ```text
    RETURN_URL#success=true|false
    ```
    Notice the use of a URL hash parameter `success`. The value is either `true` or `false` depending on whether the login succeeds or is abandoned. Ideally the Login page, when possible, will send the signal in cases of both success or failure.
5. If the `success=true` signal is returned, the AMP Runtime will repeat calls to the Authorization and Pingback endpoints to update the document’s state and report the "view" with the new access profile.

The `login` action will be triggered when the Reader clicks on a button with the `subscriptions-action="login"` attribute. For example:

```html
<button subscriptions-action="login">
  Already subscribed? Login now
</button>
```

### `subscribe`

The `subscribe` flow is as follows:

1. A request is made to the specified URL of the following format:
    ```http
    https://pub.com/amp-subscribe?
      rid=READER_ID
      &url=SOURCE_URL
      &return=RETURN_URL
    ```
    **Note:** the “return” URL parameter is added by the AMP Runtime automatically if `RETURN_URL` substitution is not specified.
2. The Subscribe page will be opened as a normal web page with no special constraints, other than it should function well as a [browser dialog](https://developer.mozilla.org/en-US/docs/Web/API/Window/open).
3. Once the Subscribe page completes its work, it must redirect back to the specified “Return URL” with the following format:
    ```text
    RETURN_URL#success=true|false
    ```
    Notice the use of a URL hash parameter `success`. The value is either `true` or `false` depending on whether the login succeeds or is abandoned. Ideally the Subscribe page, when possible, will send the signal in cases of both success or failure.
4. If the `success=true` signal is returned, the AMP Runtime will repeat calls to the Authorization and Pingback endpoints to update the document’s state and report the "view" with the new access profile.

The `subscribe` action will be triggered when the Reader clicks on a button with the `subscriptions-action="subscribe"` attribute. For example:

```html
<button subscriptions-action="subscribe">
  Subscribe now
</button>
```

## Analytics

The `amp-subscriptions` component triggers the following analytics signals:

1. `subscriptions-started`

-   Triggered when `amp-subscriptions` is initialized.
-   Data: none.

2. `subscriptions-service-registered`

-   Triggered when `amp-subscriptions` is able to resolve the instance of the service. A service is free to initialize itself at anytime on the page.
-   Data: `serviceId` of the selected service.

3. `subscriptions-service-activated`

-   Triggered when a configured service is selected and activated for use. See [service score factors][9].
-   Data: `serviceId` of the selected service.

4. `subscriptions-entitlement-resolved`

-   Triggered when the entitlement fetch for a service is complete.
-   Data: `serviceId` and `action` of the selected service.

5. `subscriptions-access-granted`

-   Triggered when the entitlement from the selected service grants access to the document.
-   Data: `serviceId` of the selected service.

6. `subscriptions-paywall-activated`

-   Triggered when the entitlement from the selected service does not grant access to the document.
-   Data: `serviceId` of the selected service.

7. `subscriptions-access-denied`

-   Triggered when the entitlement from the selected service denies access to the document.
-   Data: `serviceId` of the selected service.

8. `subscriptions-service-re-authorized`

-   Triggered when re-authorization of a service is complete. A service can request re-authorization after any action is performed e.g., `login`. A new entitlement is fetched for the service after re-authorization is complete.
-   Data: `serviceId` of the selected service.

9. `subscriptions-action-delegated`

-   Triggered just before a delegated service action is handed off to the other service. See `[subscription-service][15]`.
-   Data: `serviceId` and the delegated `action` of the selected service.

10. `subscriptions-action-ActionName-started`

-   Triggered when the execution of action `ActionName` starts.
-   Data: none.

11. `subscriptions-action-ActionName-failed`

-   Triggered when the execution of action `ActionName` fails due to any reason.
-   Data: none.

12. `subscriptions-action-ActionName-success`

-   Triggered when the execution result of action `ActionName` is reported as a success.
-   Data: none.

13. `subscriptions-action-ActionName-rejected`

-   Triggered when the execution result of action `ActionName` is reported as a failure.
-   Data: none.

14. `subscriptions-link-requested`

-   Triggered when a subscription account linking request is initiated by the selected service.
-   Data: `serviceId` of the selected service.

15. `subscriptions-link-complete`

-   Triggered when subscription account linking has been completed by the selected service.
-   Data: `serviceId` of the selected service.

16. `subscriptions-link-canceled`

-   Triggered when a subscription account linking request initiated by the selected service has been cancelled.
-   Data: `serviceId` of the selected service.

[1]: #amp-reader-id
[2]: #local-service
[3]: #authorization-endpoint
[4]: #login-page
[5]: #subscribe-page
[6]: #pingback-endpoint
[7]: #vendor-services
[8]: #fallback-entitlement
[9]: #service-score-factors
[10]: #structured-data-markup
[11]: #attributes
[12]: #actions
[13]: #url-variables
[14]: #combining-the-amp-reader-id-with-publisher-cookies
[15]: #subscription-service
