---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Implements subscription-style access protocol.
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

# amp-subscriptions

Implements subscription-style access protocol.

<table>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>
      <code>
        &lt;script async custom-element="amp-subscriptions"
        src="https://cdn.ampproject.org/v0/amp-subscriptions-0.1.js">&lt;/script>
      </code>
    </td>
  </tr>
  <tr>
    <td class="col-fourty">
      <strong>
        <a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">
          Supported Layouts
        </a>
      </strong>
    </td>
    <td>N/A</td>
  </tr>
</table>

[TOC]

## Introduction

The `amp-subscriptions` extension implements subscription-style access/paywall rules.

## Relationship to `amp-access`

The `amp-subscriptions` extension is similar to [`amp-access`](../amp-access/amp-access.md)
and in many features builds on top of `amp-access`. However, it's a much more
specialized version of access/paywall protocol. Some of the key differences are:

1. The `amp-subscriptions` entitlements response is similar to the amp-access
authorization, but it's striclty defined and standardized.
2. The `amp-subscriptions` extension allows multiple services to be configured
for the page to participate in access/paywall decisions. Services are executed
concurrently and prioritized based on which service returns the positive response.
3. AMP viewers are allowed to provide `amp-subscriptions` a signed authorization
response based on an independent agreement with publishers as a proof of access.
4. In `amp-subscriptions` content markup is standardized allowing apps and crawlers to easily detect premium content sections.

Because of standardization of markup, support for multiple providers, and improved viewer
support it is recommended that new publisher and paywall provider implementations
use `amp-subscriptions`.

## Services

There could be one or more services configured for `amp-subscriptions`. There could be a local service or vendor services. A local service is configured fully within the page, including its authorization/pingback endpoints, as well as login and subscribe actions. A vendor service is registered as an AMP extension that cooperates with the main `amp-subscriptions` extension.

## Product configuration

`amp-subscriptions` relies on the Schema.org page-level configuration for two main properties:
 1. The product ID that the user must be granted to view the content.
 2. Whether this content requires this product at this time.

The JSON-LD and Microdata formats are supported.

## JSON-LD markup

Using JSON-LD, the markup would look like:

```
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

Thus, notice that:
 1. The product ID is "norcal_tribune.com:basic" (`"productID": "norcal_tribune.com:basic"`).
 2. This document is currently locked (`"isAccessibleForFree": false`).


## Microdata markup

Using Microdata, the markup could look like this:

```
<div itemscope itemtype="http://schema.org/NewsArticle">
  <meta itemprop="isAccessibleForFree" content="false"/>
  <div itemprop="isPartOf" itemscope itemtype="http://schema.org/CreativeWork http://schema.org/Product">
    <meta itemprop="name" content="The Norcal Tribune"/>
    <meta itemprop="productID" content="norcal_tribute.com:basic"/>
  </div>
</div>
```

A usable configuration will provide `NewsArticle` typed item with `isAccessibleForFree` property and a subitem of type `Product` that specifies the `productID`.

In this example:
 1. The product ID is "norcal_tribune.com:basic" (`"productID": "norcal_tribune.com:basic"`).
 2. This document is currently locked (`"isAccessibleForFree": false`).

The configuration is resolved as soon as `productID` and `isAccessibleForFree` are found. It is, therefore, advised to place the configuration as high up in the DOM tree as possible.


## Service configuration

The `amp-subscriptions` extension must be configured using JSON configuration:

```
<script type="application/json" id="amp-subscriptions">
{
  "services": [
    {
      // Service 1 (local service)
    },
    {
      // Service 2 (a vendor service)
    }
  ],
  "score": {
    "supportsViewer": 10,
    "isReadyToPay": 9
  },
  "fallbackEntitlement": {
    "source": "fallback",
    "granted": true,
    "grantReason": "SUBSCRIBER/METERING",
    "data": {...}
  }
}
</script>
```

The `services` property contains an array of service configurations. There must be one "local" service and zero or more vendor services.

If you'd like to test the document's behavior in the context of a particular viewer, you can add `#viewerUrl=` fragment parameter. For instance, `#viewerUrl=https://www.google.com` would emulate a document's behavior inside a Google viewer.


## Selecting a service
If no service returns an entitlement that grants access, all services are compared by calculating a score for each and the highest scoring service is selected. Each service has a `"baseScore"` (default 0). A value < 100 in the `baseScore` key in any service configuration represents the initial score for that service.  If no `baseScore` is specified it defaults to `0`.

The score is calculated by taking the `baseScore` for the service and adding dynamically calculated weights from `score[factorName]` configuration multiplied by the value returned by each service for that `factorName`. Services may return a value between [-1..1] for factors they support. If a service is not aware of a factor or does not support it `0` will be returned.

If publisher wishes to ignore a score factor they may either explicitly set it's value to `0` or omit it from the `score` map.

Available scoring factors:

1. `supportsViewer` returns `1` when a service can cooperate with the current AMP viewer environment for this page view.
1. `isReadyToPay` returns `1` when the user is known to the service and the service has a form of payment on file allowing a purchase without entering payment details.

All scoring factors have default value of `0`. In the event of a tie the local service wins.


## Error fallback
If all configured services fail to get the entitlements, the entitlement configured under `fallbackEntitlement` section will be used as a fallback entitlement for `local` service. The document's unblocking will be based on this fallback entitlement.

### The "local" service configuration

Two modes of operation are supported for the local service,
"remote" and "iframe". 

In the remote mode authorization and pingback requests
are sent via CORS requests to the specified endpoints. In the
"iframe" mode authorization and pingback are provided by 
messaging to a publisher supplied iframe.

The "local" service is configured as following 

remote mode:

```
<script type="application/json" id="amp-subscriptions">
{
  "services": [
    {
      "authorizationUrl": "https://...",
      "pingbackUrl": "https://...",
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

iframe mode:

```
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
 - "type" - optional type, defaults to "remote"
 - "authorizationUrl" - the authorization endpoint URL.
 - "pingbackUrl" - the pingback endpoint URL.
 - "actions" - a named map of action URLs. At a minimum there must be two actions specified: "login" and "subscribe".

In iframe mode the `authorzationUrl` and `pingbackUrl` are deleted
and replaced by:
 - "iframeSrc" - publisher supplied iframe
 - "iframeVars - AMP variables to be sent to the iframe
 - "type" - must be "iframe"

See [amp-access-iframe](../amp-access/0.1/iframe-api/README.md) for details of the messaging protocol.

### The vendor service configuration

The vendor service configuration must reference the service ID and can contain any additional properties allowed by the vendor service.

```
<script type="application/json" id="amp-subscriptions">
{
  "services": [
    ...,
    {
      "serviceId": "subscribe.google.com"
    }
  ]
}
</script>
```

See the vendor service's documentation for details.


## Authorization endpoint and entitlements

Authorization is an endpoint provided by the local service and called by the AMP Runtime. It is a credentialed CORS GET endpoint. This endpoint returns the Entitlements object that can be used by the Content Markup to hide or show different parts of the document. Authorization endpoint is specified using the "authorizationUrl" property in the config.

The Entitlement response returned by the authorization endpoint must conform to the predefined format:

```
{
  "granted": true/false,
  "grantReason": "SUBSCRIBER/METERING",
  "data" : {...}
}
```

The properties in the Entitlement response are:
 - `granted` - boolean stating if the access to the document is granted or not.

 - `grantReason` - the string of the reason for giving the access to the document, recognized reasons are either SUBSCRIBER meaning the user is fully subscribed or METERING meaning user is on metering.

 - `data` - free-form data which can be used for template rendering, e.g. messaging related to metering or article count.

In cases where the access is granted by a means other than the Entitlement response, messaging via the data property may not be seen by the user.  Do not use `data` for granting/denying access to content, conditional display of content based on user access, or displaying user or account related information.

Notice, while it's not explicitly visible, all vendor services also implement authorization endpoints of their own and conform to the same response format.


## Pingback endpoint

Pingback is an endpoint provided by in the "local" service configuration and called by the AMP Runtime. It is a credentialed CORS POST endpoint. AMP Runtime calls this endpoint automatically when the Reader has started viewing the document. One of the main goals of the Pingback is for the Publisher to update metering information.

Pingback is optional. It's only enabled when the "pingbackUrl" property is specified.

As the body, pingback POST request receives the entitlement object returned by the "winning" authorization endpoint.

**Important:** The pingback JSON object is sent with `Content-type: text/plain`.  This is intentional as it removes the need for a CORS preflight check.

## Actions

Actions are provided in the "local" service configuration in the "actions" property. It's a named set of action. Any number of actions can be configured this way, but two actions are required: "login" and "subscribe".

All actions work the same way: the popup window is opened for the specified URL. The page opened in the popup window can perform the target action, such as login/subscribe/etc, and it's expected to return by redirecting to the URL specified by the "return" query parameter.

Notice, while not explicitly visible, any vendor service can also implement its own actions. Or it can delegate to the "login" service to execute "login" or "subscribe" action.

### Action delegation

In the markup the actions can be delegated to other services for them to execute the actions. This can be achieved by specifying `subscriptions-service` attribute.

e.g. In order to ask google subscriptions to perform subscribe even when `local` service is selected:
```
  <button subscriptions-action='subscribe' subscriptions-service='subscribe.google.com>Subscribe</button>
```

### Action decoration

In addition to delegation of the action to another service, you can also ask another service to decorate the element. Just add the attribute `subsciptions-decorate` to get the element decorated.

```
  <button
    subscriptions-action='subscribe'
    subscriptions-service='subscribe.google.com
    subscriptions-decorate
  >
    Subscribe
  </button>
```

## Showing/hiding premium and fallback content

The premium sections are shown/hidden automatically based on the authorization/entitlements response. There are two types of sections of this kind.

The premium content is marked up using `subscriptions-section="content"` attribute. For instance:

```
<section subscriptions-section="content">
  This content will be hidden unless the reader is authorized.
</section>
```

*Important*: Do not apply `subscriptions-section="content"` to the whole page. Doing so may cause a visible flash when content is later displayed, and may prevent your page from being indexed by search engines. We recommend that the content in the first viewport be allowed to render regardless of subscription state.

The fallback content is marked up using `subscriptions-section="content-not-granted"` attribute. For instance:

```
<section subscriptions-section="content-not-granted">
  You are not allowed to currently view this content.
</section>
```

## Action markup

An action declared in the "actions" configuration can be marked up using `subscriptions-action` attribute.

For instance, this button will execute the "subscribe" action:

```
<button subscriptions-action="subscribe" subscriptions-display="EXPR">Subscribe now</button>
```

By default, the actions are hidden and must be explicitly shown using the `subscriptions-display` expression.

## Paywall dialogs

The paywall dialogs are shown automatically based on the authorization/entitlements response.

A dialog is marked up using the `subscriptions-dialog` and `subscriptions-display` attributes:

```
<div subscriptions-dialog subscriptions-display="EXPR">
  This content will be shown as a dialog when "subscription-display"
  expression matches.
</div>
```

The element on which `subscriptions-dialog` dialog is specified can also be a `<template>` element in which case it will be initially rendered before being displayed as a dialog. For instance:

```
<template type="amp-mustache" subscriptions-dialog subscriptions-display="EXPR">
  <div>
    You have {{metering.left}} articles left this month.
  </div>
</template>
```

The first dialog with matching `subscriptions-display` is shown.


## Expressions

The `subscriptions-display` attribute uses expressions for actions and dialogs. The value of `subscriptions-display` is a boolean expression defined in a SQL-like language. The grammar is defined in [amp-access Appendix A](../amp-access/amp-access.md#appendix-a-amp-access-expression-grammar).

Values in the `data` object of an Entitlements response can be used to build expressions.  In this example the values of `isLoggedIn` and `isSubscriber` are in the `data` object and are used to conditionally show UI for login and upgrading your account:

```
<section>
  <button subscriptions-action="login" subscriptions-display="NOT data.isLoggedIn">Login</button>
  <div subscriptions-actions subscriptions-display="data.isLoggedIn">
    <div>My Account</div>
    <div>Sign out</div>
  </div>
  <div subscriptions-actions subscriptions-display="data.isLoggedIn AND NOT data.isSubscriber">
    <a href='...'>Upgrade your account</a>
  </div>
</section>
```


## Analytics

The `amp-subscriptions` extension triggers the following analytics signals:

1. `subscriptions-started`
 - Triggered when `amp-subscriptions` is initialized.
 - Data: none.
2. `subscriptions-service-registered`
 - Triggered when `amp-subscriptions` is able to resolve the instance of the service.  A service is free to initialize itself at anytime on the page.
 - Data: `serviceId` of the selected service.
3. `subscriptions-service-activated`
 - Triggered when a configured service is selected and activated for use.  See [Selecting a service](#selecting-a-service).
 - Data: `serviceId` of the selected service.
4. `subscriptions-entitlement-resolved`
 - Triggered when the entitlement fetch for a service is complete.
 - Data: `serviceId` and `action` of the selected service.
5. `subscriptions-access-granted`
 - Triggered when the entitlement from the selected service grants access to the document.
 - Data: `serviceId` of the selected service.
6. `subscriptions-paywall-activated`
 - Triggered when the entitlement from the selected service does not grant access to the document.
 - Data: `serviceId` of the selected service.
7. `subscriptions-access-denied`
 - Triggered when the entitlement from the selected service denies access to the document.
 - Data: `serviceId` of the selected service.
8. `subscriptions-service-re-authorized`
 - Triggered when re-authorization of a service is complete.  A service can request re-authorization after any action is performed e.g., `login`.  A new entitlement is fetched for the service after re-authorization is complete.
 - Data: `serviceId` of the selected service.
9. `subscriptions-action-delegated`
 - Triggered just before a delegated service action is handed off to the other service.  See [Action delegation](#action-delegation).
 - Data: `serviceId` and the delegated `action` of the selected service.
10. `subscriptions-action-ActionName-started`
 - Triggered when the execution of action `ActionName` starts.
 - Data: none.
11. `subscriptions-action-ActionName-failed`
 - Triggered when the execution of action `ActionName` fails due to any reason.
 - Data: none.
12. `subscriptions-action-ActionName-success`
 - Triggered when the execution result of action `ActionName` is reported as a success.
 - Data: none.
13. `subscriptions-action-ActionName-rejected`
 - Triggered when the execution result of action `ActionName` is reported as a failure.
 - Data: none.
14. `subscriptions-link-requested`
 - Triggered when a subscription account linking request is initiated by the selected service.
 - Data: `serviceId` of the selected service.
15. `subscriptions-link-complete`
 - Triggered when subscription account linking has been completed by the selected service.
 - Data: `serviceId` of the selected service.
16. `subscriptions-link-canceled`
 - Triggered when a subscription account linking request initiated by the selected service has been cancelled.
 - Data: `serviceId` of the selected service.

## Available vendor services

- [amp-subscriptions-google](../amp-subscriptions-google/amp-subscriptions-google.md)
