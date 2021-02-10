---
$category@: social
formats:
  - websites
teaser:
  text: Displays an Instagram embed.
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

# amp-instagram

## Behavior

The `width` and `height` attributes are special for the Instagram embed.
These should be the actual width and height of the Instagram image.
The system automatically adds space for the "chrome" that Instagram adds around the image.

Many Instagrams are square. When you set `layout="responsive"` any value where `width` and `height` are the same will work.

Example:

```html
<amp-instagram
  data-shortcode="fBwFP"
  data-captioned
  width="400"
  height="400"
  layout="responsive"
>
</amp-instagram>
```

If the Instagram is not square you will need to enter the actual dimensions of the image.

When using non-responsive layout you will need to account for the extra space added for the "instagram chrome" around the image. This is currently 48px above and below the image and 8px on the sides.

### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-instagram` component in standalone use.

[example preview="top-frame" playground="false"]

```html
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-instagram-1.0.css">
  <script async custom-element="amp-instagram" src="https://cdn.ampproject.org/v0/amp-instagram-1.0.js"></script>
  <style>
    amp-instagram {
      aspect-ratio: 1/2;
    }
  </style>
</head>
<amp-instagram data-shortcode="CKXYAzuj7TE"></amp-instagram>
```

[/example]

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-instagram-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

**Container type**

The `amp-instagram` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
amp-instagram {
  height: 500px;
  width: 100px;
}
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-shortcode</strong></td>
    <td>The instagram data-shortcode is found in every instagram photo URL.
<br>
For example, in https://instagram.com/p/fBwFP, <code>fBwFP</code> is the data-shortcode.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-captioned</strong></td>
    <td>Include the Instagram caption. <code>amp-instagram</code> will attempt to resize to the correct height including the caption.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>
