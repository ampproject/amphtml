---
$category@: layout
formats:
  - websites
teaser:
  text: Displays elements in a full-viewport “lightbox” modal.
experimental: true
bento: true
---

<!---
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# amp-lightbox

## Usage

The `amp-lightbox` component defines child elements that display in a
full-viewport overlay/modal. When the user taps or clicks an element (e.g., a
button), the `amp-lightbox` ID referenced in the clicked element's `on`
attribute triggers the lightbox to take up the full viewport and displays the
child elements of the `amp-lightbox`.

[tip type="read-on"]

For showing images in a lightbox, there's also the
[`<amp-image-lightbox>`](../amp-image-lightbox/amp-image-lightbox.md)
component. To show a gallery of images in a lightbox, you can use
[`<amp-lightbox-gallery>`](../amp-lightbox-gallery/amp-lightbox-gallery.md).

[/tip]

### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-lightbox` component in standalone use.

[example preview="top-frame" playground="false"]

```html
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-lightbox-1.0.css">
  <script async custom-element="amp-lightbox" src="https://cdn.ampproject.org/v0/amp-lightbox-1.0.js"></script>
</head>
<amp-lightbox id="my-lightbox">
  Lightboxed content
  <button id='close-button'>Close lightbox</button>
</amp-lightbox>
<button id='open-button'>Open lightbox</button>
<script>
  (async () => {
    const lightbox = document.querySelector('#my-lightbox');
    await customElements.whenDefined('amp-lightbox');
    const api = await lightbox.getApi();

    // set up button actions
    document.querySelector('#open-button').onclick = () => api.open();
    document.querySelector('#close-button').onclick = () => api.close();
  })();
</script>
```

[/example]

#### Interactivity and API usage

Bento enabled components in standalone use are highly interactive through their API. In Bento standalone use, the element's API replaces AMP Actions and events and [`amp-bind`](https://amp.dev/documentation/components/amp-bind/?format=websites).

The `amp-lightbox` component API is accessible by including the following script tag in your document:

```js
await customElements.whenDefined('amp-lightbox');
const api = await lightbox.getApi();
```

##### Actions

The `amp-lightbox` API allows you to perform the following actions:

**open()**
Opens the lightbox.

```js
api.open();
```

**close()**
Closes the lightbox.

```js
api.close();
```

##### Events

The `amp-lightbox` API allows you to register and respond to the following events:

**open**

This event is triggered when the lightbox is opened.

```js
lightbox.addEventListener('open', (e) => console.log(e))
```

**close**

This event is triggered when the lightbox is closed.

```js
lightbox.addEventListener('close', (e) => console.log(e))
```

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-lightbox-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

## Attributes

### `id`

A unique identifier for the lightbox.

### `layout` (required)

Must be set to `nodisplay`.

### `animation`

Defines the style of animation for opening the lightbox. By default, this will
be set to `fade-in`. Valid values are `fade-in`, `fly-in-bottom`, and
`fly-in-top`.

This attribute can be configured to use different
options based on a [media query](./../../spec/amp-html-responsive-attributes.md).

### `scrollable`

When the `scrollable` attribute is present, the content of the lightbox can
scroll when overflowing the height of the lightbox.

## Actions

### `open` (default)

Opens the lightbox.

### `close`

Closes the lightbox.

## Styling

You can style the `amp-lightbox` with standard CSS.

## Accessibility

Pressing the escape key on the keyboard or setting focus on an element outside
the lightbox closes the lightbox. Alternatively, setting the `on` attribute on
one or more elements within the lightbox and setting its method to `close`
closes the lightbox when the element is tapped or clicked. Once closed, the
focus will be sent back to the trigger element.

For accessibility reasons, if the user does not provide a focus in the lightbox
on open (using `autofocus` attribute or forcing focus on open), the focus will
be set on the first element using `on:tap`. Otherwise, a close button only
visible to screen readers, optionally using `data-close-button-aria-label`
attribute value, will be created and focused on.

```html
<button on="tap:quote-lb">See Quote</button>
<amp-lightbox id="quote-lb" layout="nodisplay">
  <blockquote>
    "Don't talk to me about JavaScript fatigue" - Horse JS
  </blockquote>
  <button on="tap:quote-lb.close">Nice!</button>
</amp-lightbox>
```

## Version notes

The experimental `1.0` version of `amp-lightbox` employs the following differences from version `0.1`:

-   This component does not currently support modifying browser history state.
-   `data-close-button-aria-label` is not supported and will soon be replaced with support for `slot="close-button"`.
-   `animate-in` has been renamed to `animation`.
