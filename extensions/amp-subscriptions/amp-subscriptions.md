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

# <a name="amp-subscriptions"></a> `amp-subscriptions`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Implements subscription-style access protocol.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Experimental. Only in Canary.</td>
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

The `amp-subscriptions` extensions implements the subscription-style access/paywall rules.

## Relationship to `amp-access`

The `amp-subscriptions` is similar to [`amp-access`](../amp-access/amp-access.md) and in many features builds on top of `amp-access`. However, it's a much more specialized version of access/paywall protocol. Some of the key differences are:

1. Entitlements response is similar to the amp-access authorization, but it's striclty defined and standardized.
2. The `amp-subscriptions` allows multiple services to be configured for the page to participate in access/paywall decisions. They are executed in parallel and paralized based on which service returns the positive response.
3. The viewers are allowed to provide a signed authorization response based on an independent agreement with publishers as a proof of access.

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


## Selecting platform
So if no platforms are selected, we compete all the platforms based on platforms like

1. Does the platform support the Viewer

You can add `"baseScore"` < 100 key in any service configuration in case you want to increase `"baseScore"` of any platform so that it wins over other score evaluation factors.

## Error fallback
In case if all configured platforms fail to get the entitlements, the entitlement configured under `fallbackEntitlement` section will be used as a fallback entitlement for `local` platform. The document's unblocking will be based on this fallback entitlement.

### The "local" service configuration

The "local" service is configured as following:

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

The properties in the "local" service are:
 - "authorizationUrl" - the authorization endpoint URL.
 - "pingbackUrl" - the pingback endpoint URL.
 - "actions" - a named map of action URLs. At a minimum there must be two actions specified: "login" and "subscribe".

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


## Authorization endpoint and Entitlements

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
 - "granted" - boolean stating if the access to the document is granted or not.
 - "grantReason" - the string of the reason for giving the access to the document, recognized reasons are either SUBSCRIBER meaning the user is fully subscribed or METERING meaning user is on metering.
 - "data" - any free form data which can be used for render templating.

Notice, while it's not explicitly visible, all vendor services also implement authorization endpoints of their own and conform to the same response format.


## Pingback endpoint

Pingback is an endpoint provided by in the "local" service configuration and called by the AMP Runtime. It is a credentialed CORS POST endpoint. AMP Runtime calls this endpoint automatically when the Reader has started viewing the document. One of the main goals of the Pingback is for the Publisher to update metering information.

Pingback is optional. It's only enabled when the "pingbackUrl" property is specified.

As the body, pingback POST request recieves the entitlement object returned by the "winning" authorization endpoint.


## Actions

Actions are provided in the "local" service configuration in the "actions" property. It's a named set of action. Any number of actions can be configured this way, but two actions are required: "login" and "subscribe".

All actions work the same way: the popup window is opened for the specified URL. The page opened in the popup window can perform the target action, such as login/subscribe/etc, and it's expected to return by redirecting to the URL specified by the "return" query parameter.

Notice, while not explicitly visible, any vendor service can also implement its own actions. Or it can delegate to the "login" service to execute "login" or "subscribe" action.

### Action delegation

In the markup the actions can be delegated to other services for them to execute the actions. This can be achieved by specifying `subscriptions-service` attribute.

e.g. In order to ask google subscriptions to perform subscribe even when `local` platform is selected:
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

The `subscriptions-display` uses expressions for actions and dialogs.

The value of the `subscriptions-display` is a boolean expression defined in a SQL-like language. The grammar is defined in the [AMP Access Appendix 1][../amp-acccess/amp-access.md#appendix-a-amp-access-expression-grammar].

The expression is executed against the json representation of the entitlement object.

For instance, to show a "subscribe" action to non-subscribers:

```
<button subscriptions-display="NOT subscribed" subscriptions-action="subscribe">Become a subscriber</button>
```


## Available vendor services

- [amp-subscriptions-google](../amp-subscriptions-google/amp-subscriptions-google.md)

