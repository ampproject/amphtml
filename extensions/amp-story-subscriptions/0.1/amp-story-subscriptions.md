---
$category@: presentation
formats:
  - stories
teaser:
  text: A configurable, templated subscriptions experience in AMP story pages.
tags:
  - subscriptions
author: ychsieh
toc: true
$title: amp-story-subscriptions
version: '0.1'
versions:
  - '0.1'
latest_version: '0.1'
$path: /documentation/components/amp-story-subscriptions.html
$localization:
  path: '/{locale}/documentation/components/amp-story-subscriptions.html'
scripts:
  - >-
    <script async custom-element="amp-subscriptions"    
    src="https://cdn.ampproject.org/v0/amp-subscriptions-0.1.js"></script>
    <script async custom-element="amp-subscriptions-google"
    src="https://cdn.ampproject.org/v0/amp-subscriptions-google-0.1.js"></script>
    <script async custom-element="amp-story" 
    src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
    <script async custom-element="amp-story-subscriptions" src="https://cdn.ampproject.org/v0/amp-story-subscriptions-0.1.js"></script>
---

# amp-story-subscriptions

<amp-img alt="amp-story-subscriptions example UI" src="https://user-images.githubusercontent.com/1697814/167689085-94d9032f-e501-47cd-b06f-e40c8405b27f.png" layout="intrinsic" width="377" height="684"></amp-img>

# Summary

This component enables Web Stories to support paywalls and subscriptions in a manner following [`amp-subscriptions`](https://amp.dev/documentation/components/amp-subscriptions/) and [`amp-subscriptions-google`](https://amp.dev/documentation/components/amp-subscriptions-google/). It enables publishers to configure their Stories to feature paywalls and integrate into their backends via authorization URLs (similar to [`amp-subscriptions`](https://amp.dev/documentation/components/amp-subscriptions/#url-variables)). The extension provides a simple UI and capabilities to surface a paywall bottomsheet, and manage blocking / unblocking locked content.

> **Important Note**: Please first read API docs for [`amp-subscriptions`](https://amp.dev/documentation/components/amp-subscriptions/) and (optionally) [`amp-subscriptions-google`](https://amp.dev/documentation/components/amp-subscriptions-google/) and ensure you are set up with those basic capabilities before integrating with this component.

# How it works

1. Publishers can configure a Web Story with the component to implement a paywall.
    - Paywall cannot be triggered on the first two pages of a Story or on the last page or on a Story with fewer than 4 pages.
2. When the user navigates to the first paywalled page of the Story, <amp-story-subscriptions> will check if the user has access via <amp-subscriptions>. If yes, the user can consume the Story without any interruption.
3. If the access is not granted, a paywall bottomsheet is shown at the bottom of the page. The paywall only prevents users from accessing the remaining pages of the Story, the user can otherwise navigate as normal (tap to previous pages, or swipe to a different Story if available).
4. The paywall has a standard UX, but allows for key messages to be customized by the publisher.
5. Depending on publisher configuration, the dialog can support three different ways to progress:
    - Sign-in with publisher’s sign-in flow (i.e. publisher provided sign-in page).
    - Subscribe directly via the publisher (i.e. via a publisher provided subscription page).
    - If enabled by the publisher, subscribe via [Subscribe with Google](https://developers.google.com/news/subscribe).
6. If the user completes any of the above authentication flows, the user is returned to the Story page, the paywall is dismissed and the user can consume the rest of the Story.
7. If the user encounters a subsequent paywalled Story from this publisher, they will continue to retain access based on [amp-subscription mechanisms](https://amp.dev/documentation/components/amp-subscriptions/#combining-the-amp-reader-id-with-publisher-cookies).

# Subscriptions JSON Configuration Example

```html
...
<script type="application/ld+json">
     {
       "@context": "http://schema.org",
       "@type": "NewsArticle",
       "isAccessibleForFree": "False",
       "isPartOf": {
         "@type": ["CreativeWork", "Product"],
         "name" : "Product A",
         "productID": "publisher.domain.com:product"
       }
     }
</script>
<script type="application/json" id="amp-subscriptions">
     {
       "services": [
         {
           "authorizationUrl": "https://publisher.domain.com/entitlement",
           "pingbackUrl": "https://publisher.domain/pingback",
           "actions":{
             "login": "https://publisher.domain.com/signin",
             "subscribe": "https://publisher.domain.com/subscribe"
           }
         },
         {
           "serviceId": "subscribe.google.com"
         }
       ]
     }
</script>
...
```

See details about specifying this configuration in [`amp-subscriptions`](https://amp.dev/documentation/components/amp-subscriptions/).

# `amp-story` and `amp-story-subscriptions` attributes

```html
<amp-story publisher-logo-src='https://publisher-domain.com/logo.jpg'>
    <amp-story-page>...</amp-story-page>
    ...
    <amp-story-subscriptions subscriptions-page-index='3' price='$0.50/week' headline='Culture at your fingertips' description='Subscribe for unlimited access.' additional-description='Cancel anytime.'>
    </amp-story-subscription>
</amp-story>
```

### `publisher-logo-src` {string} required

A logo URL to show the publisher’s subscribe button.

### `subscriptions-page-index` {number} optional

The index of the page that would show the subscriptions dialog. If not specified, it defaults to 2, which is the 3rd page of the story. Note that this specified page cannot be the first two pages nor the last page of the story.

### `price` {string} required

Subscription/offer price.

### `headline` {string} optional

A headline string that describes the subscription/offer.

### `Description` {string} required

One line of description for the subscription/offer.

### `additional-description` {string} optional

Additional line of description for the subscription/offer.

# Validation

See validation rules in [amp-story-subscriptions validator](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story-subscriptions/validator-amp-story-subscriptions.protoascii).
