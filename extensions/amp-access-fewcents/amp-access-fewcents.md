---
$category@: presentation
formats:
  - websites
teaser:
  text: Allows publishers to integrate with the Fewcents micropayments platform.
---

# amp-access-fewcents

-   The `amp-access-fewcents` component is based on, and requires [`amp-access`](../amp-access/amp-access.md)
-   amp-access-fewcents is built to be used with amp pages which internally uses amp-access to provide a behavior similar to amp-access, but built in such a way that it can be used with Fewcents.
-   amp-access-fewcents component does not require an authorization, pingback or login configuration, because it is pre-configured to work with the Fewcents. You just need to pass or configure the extension according to your need like primary color for button, Publisher's can have their logo on the paywall.
-   This component also relies on Access Content Markup to show and hide content.

## Usage

### The configuration on the pulisher end will look like this

```html
  <script id="amp-access" type="application/json">
    {
      "vendor": "fewcents",
      "fewcents": {
        "publisherLogoUrl" : "logoUrl",
        "contentSelector" : "amp-access-fewcents-dialog",
        "primaryColor" : "#0000FF",
        "accessKey" : "samplehost",
        "category": "paywall",
        "articleIdentifier": "sampleidentifier"
      }
    }
  </script>
```

### Where as the content access markup could end up looking like this:

The example below demonstrates `amp-access-fewcents` component in standalone use.

```html
  <section amp-access="NOT access" amp-access-hide>
    <div id="amp-access-fewcents-dialog"></div>
  </section>

  <section amp-access="error" amp-access-hide class="error-section">
    Oops... Something broke.
  </section>

  <div amp-access="access" amp-access-hide>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
      ullamcorper turpis vel commodo scelerisque. Phasellus luctus nunc ut
      elit cursus, et imperdiet diam vehicula. Duis et nisi sed urna blandit
      bibendum et sit amet erat. Suspendisse potenti.
    </p>
  </div>
```

Element div with id `amp-access-fewcents-dialog` is where the paywall will going to show up when user don't have the access to the article.

### The following resources provide further documentation on using Fewcents with AMP:

-   [`amp-access`](https://amp.dev/documentation/components/amp-access)
-   [Fewcents](https://www.fewcents.co/)

## Configuration

Configuration is similar to `amp-access`, but no authorization, pingback and login links are required.

```html
  <script id="amp-access" type="application/json">
    {
      "vendor": "fewcents",
      "fewcents": {
        "publisherLogoUrl" : "logoUrl",
        "contentSelector" : "amp-access-fewcents-dialog",
        "primaryColor" : "#0000FF",
        "accessKey" : "samplehost",
        "category": "paywall",
        "articleIdentifier": "sampleidentifier"
      }
    }
  </script>
```

### Keys summary:

-   `vendor` : This is mandatory to pass and its value is "fewcents"
-   `publisherLogoUrl` : Url of image of the publisher logo in the format of png.
-   `contentSelector` : Id of div element where paywall will be rendered
-   `primaryColor` : Background colour of the unlock button, else default colour will be used
-   `accessKey` : This will be provided by fewcents to the publisher
-   `categoty` : Represent catetory of paywall and will be provided by fewcents
-   `articleIdentifier` : This lets fewcents to uniquely identify each article, and publisher should share this data with fewcents

## Analytics

Given that `amp-access-fewcents` is based on `amp-access` it supports all the [analytics events](../amp-access/amp-access.md) sent by `amp-access`.

Several analytics reports are sent to fewcents on user actions on the paywall.

## Layout and style

```
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-access-fewcents-0.1.css">
```
