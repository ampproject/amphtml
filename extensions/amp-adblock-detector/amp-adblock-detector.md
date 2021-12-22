---
$category@: ads-analytics
formats:
  - websites
teaser:
  text: Detects Ad-Blocker and display fallback.
---

# amp-adblock-detector

## Usage

`amp-adblock-detector` detects Ad-Blocker and displays fallback. It works as a wrapper component around the `amp-ad`.

**Example**

[example preview="inline" playground="true" imports="amp-adblock-detector"]

```html
<amp-adblock-detector layout="fixed" width="120" height="600">
  <amp-ad
    width="120"
    height="600"
    type="doubleclick"
    data-slot="/21730346048/test-skyscraper"
  >
    <div fallback>
      <p>Error while loading Ad</p>
    </div>
  </amp-ad>
  <div
    status="blocked"
    style="border: 2px solid red; border-radius: 10px; margin: 5px; padding: 5px;"
  >
    <h2>Ad Blocker Detected</h2>
    <p>Please allow ads to run on this page.</p>
  </div>
</amp-adblock-detector>
```

[/example]

<!--
  * [Read more about filtering sections](https://amp.dev/documentation/guides-and-tutorials/contribute/contribute-documentation/formatting/?format=websites#filtering-sections)
  * [Read more about executable code samples](https://amp.dev/documentation/guides-and-tutorials/contribute/contribute-documentation/formatting/?format=websites#preview-code-samples)
 -->

### Standalone use outside valid AMP documents (optional)

<!-- TODO: Remove backticks from link when guide is live -->

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-adblock-detector` component in standalone use.

[example preview="top-frame" playground="false"]

```html
<head>
...
<script async src="https://cdn.ampproject.org/v0.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-adblock-detector-1.0.css">
<script async custom-element="amp-adblock-detector" src="https://cdn.ampproject.org/v0/amp-adblock-detector-1.0.js"></script>
...
</head>
<amp-adblock-detector>
  <amp-ad
    ...
  >
  </amp-ad>
  <div status="blocked">
    <!-- fallback markup goes here -->
  </div>
</amp-adblock-detector>
```

[/example]

#### Interactivity and API usage

Bento enabled components in standalone use are highly interactive through their API. In Bento standalone use, the element's API replaces AMP Actions and events and [`amp-bind`](https://amp.dev/documentation/components/amp-bind/?format=websites).

The `amp-adblock-detector` component API is accessible by including the following script tag in your document:

```
await customElements.whenDefined('amp-adblock-detector-component');
const api = await AdblockDetector.getApi();
```

The `amp-adblock-detector` API allows you to register and respond to the following events:

**onBlock**
Fires when Ad-Blocker is detected.

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-adblock-detector-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

## Events

### `onblock`

`onblock` will be fired when an Ad-Blocker is detected.

#### Valid AMP

Syntax and argument details for use in fully valid AMP pages.

[example preview=”top-frame” playground=”true”]

```html
<head>
  <script
    custom-element="amp-adblock-detector"
    async
    src="https://cdn.ampproject.org/v0/amp-adblock-detector-latest.js"
  ></script>
</head>
<body>
  <amp-adblock-detector>
    <amp-ad
      ...
    >
    </amp-ad>
    <div status="blocked">
      <!-- fallback markup goes here -->
    </div>
  </amp-adblock-detector>
</body>
```

[/example]

#### Bento mode

Syntax and argument details for use in Bento mode.

```
<WIP>
```

## Limitation

`amp-adblock-detector` is only designed to work as wrapper around `amp-ad` and cannot work with `amp-sticky-ad`.

## Validation

See [amp-adblock-detector rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-adblock-detector/validator-amp-adblock-detector.protoascii) in the AMP validator specification.
