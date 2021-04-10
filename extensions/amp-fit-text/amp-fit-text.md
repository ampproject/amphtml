---
$category@: presentation
formats:
  - websites
teaser:
  text: Expands or shrinks font size to fit the content within the space given.
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

# amp-fit-text

## Usage

Expands or shrinks its font size to fit the content within the space given to it.

The `amp-fit-text` component allows you to manage the size and fit of text within a specified area. For content contained in an `amp-fit-text` element, the `amp-fit-text` component finds the best font size to fit all of the content within the available space. The expected content for `amp-fit-text` is text or other inline content, but it can also contain non-inline content.

In the following example, the `<amp-fit-text>` element is nested within a 300x300 blue `div` block. For the `<amp-fit-text>` element, we specified a `responsive` layout. As a result, the text scales responsively per the aspect ratio provided by the width and height (200x200) of the `<amp-fit-text>` element, but the text does not exceed the size of its parent.

[example preview="inline" playground="true" imports="amp-fit-text:1.0"]

```html
<div style="width: 300px; height: 300px; background:#005AF0; color: #FFF;">
  <amp-fit-text width="200" height="200" layout="responsive">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt.
  </amp-fit-text>
</div>
```

[/example]

The following example is similar to the one above, but in this example we specify a `max-font-size` of `22`, so the text is smaller but still fits the space:

[example preview="inline" playground="true" imports="amp-fit-text:1.0"]

```html
<div style="width: 300px; height: 300px; background:#005AF0; color: #FFF;">
  <amp-fit-text width="200" height="200" layout="responsive" max-font-size="22">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt.
  </amp-fit-text>
</div>
```

[/example]

### Migrating from 0.1

Unlike `0.1`, the experimental `1.0` version of `amp-fit-text` does not account for margin and border size as contributing to the total fit-text coverage area.

### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-fit-text` component in standalone use.

[example preview="top-frame" playground="false"]

```html
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-fit-text-1.0.css">
  <script async custom-element="amp-fit-text" src="https://cdn.ampproject.org/v0/amp-fit-text-1.0.js"></script>
  <style>
    amp-fit-text {
      aspect-ratio: 4/3;
    }
  </style>
</head>
<amp-fit-text id="my-fit-text">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</amp-fit-text>
<div class="buttons" style="margin-top: 8px;">
  <button id="font-button">Change max-font-size</button>
  <button id="content-button">Change content</button>
</div>

<script>
  (async () => {
    const fitText = document.querySelector('#my-fit-text');
    await customElements.whenDefined('amp-fit-text');

    // set up button actions
    document.querySelector('#font-button').onclick = () => fitText.setAttribute('max-font-size', '40');
    document.querySelector('#content-button').onclick = () => fitText.textContent = 'new content';
  })();
</script>
```

[/example]

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-fit-text-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

**Container type**

The `amp-fit-text` component has a defined layout size type. To ensure the component renders correctly, apply the following styles:

```css
amp-fit-text {
  aspect-ratio: 4/3;
}
```

### Overflowing content

If the content of the `amp-fit-text` overflows the available space, even with a
`min-font-size` specified, the overflowing content is cut off and hidden. WebKit and Blink-based browsers show ellipsis for overflowing content.

In the following example, we specified a `min-font-size` of `40`, and added more content inside the `amp-fit-text` element. This causes the content to exceed the size of its fixed block parent, so the text is truncated to fit the container.

[example preview="inline" playground="true" imports="amp-fit-text:1.0"]

```html
<div style="width: 300px; height: 300px; background:#005AF0; color: #FFF;">
  <amp-fit-text width="200" height="200" layout="responsive" min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </amp-fit-text>
</div>
```

[/example]

#### Accessibility considerations of overflowing content

While overflowing content is _visually_ truncated to fit the container, note that it's still present in the document. Do not rely on the overflow behaviour to simply "stuff" large amounts of content in your pages - while visually it may look appropriate, it may lead to the page becoming overly verbose to users of assistive technologies (such as screen readers), as for these users all the truncated content will still be read/announced in full.

## Attributes

### Media Queries

The attributes for `<amp-fit-text>` can be configured to use different
options based on a [media query](./../../spec/amp-html-responsive-attributes.md).

### `min-font-size`

Specifies the minimum font size as an integer that the `amp-fit-text` can use.

### `max-font-size`

Specifies the maximum font size as an integer that the `amp-fit-text` can use.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Styling

You can style the `amp-fit-text` with standard CSS. In particular, you can use `text-align`, `font-weight`, `color` and many other CSS properties, with the main exception of `font-size`.
