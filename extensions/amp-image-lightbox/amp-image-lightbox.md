---
$category@: layout
formats:
  - websites
  - email
teaser:
  text: Provides a lightbox effect for a specified image.
---
<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# amp-image-lightbox

Provides a lightbox effect for a specified image.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-image-lightbox" src="https://cdn.ampproject.org/v0/amp-image-lightbox-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-image-lightbox/">amp-image-lightbox</a> sample.</td>
  </tr>
</table>

[TOC]

## Behavior

The `amp-image-lightbox` component provides a lightbox experience for a specified image. When the user clicks the image, the image displays in the center of a full-viewport lightbox.

#### Typical usage

The following is a typical example using an `amp-image-lightbox`:

```html
<amp-image-lightbox id="lightbox1" layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
    role="button"
    tabindex="0"
    src="image1.jpg"
    width="200" height="100"></amp-img>
```

When the user clicks the image, the `<amp-img>` activates the `<amp-image-lightbox>` via the [`on`](https://www.ampproject.org/docs/reference/spec#on) action, which references the ID of the `<amp-image-lightbox>` element (i.e., `lightbox1`). The `<amp-image-lightbox>` then displays the image in the center of the full-viewport lightbox. Note that the `amp-image-lightbox` element itself must be empty and must be set to `layout=nodisplay`.

Among other things the `amp-image-lightbox` allows the following user manipulations: zooming, panning, showing/hiding of the description.
Pressing the escape key on a keyboard closes the lightbox.

*Using a single lightbox for multiple images*

You can use the same `amp-image-lightbox` for more than one image on the AMP page.

In this example, two images display: a cat and a frog.  When the user clicks either image, the image displays in the lightbox.

```html
<amp-image-lightbox id="lightbox1" layout="nodisplay"></amp-image-lightbox>

<amp-img on="tap:lightbox1"
    role="button"
    tabindex="0"
    src="/img/frog.jpg"
    layout="responsive"
    width="360" height="360"></amp-img>

<amp-img on="tap:lightbox1"
    role="button"
    tabindex="0"
    src="/img/cat.jpg"
    layout="responsive"
    width="360" height="360"></amp-img>
```

### Captions

Optionally, you can display captions at the bottom of the viewport for the image. The `<amp-image-lightbox>` components determines the content for the caption as follows:

1.  If the image is in a `figure` tag, the content of the `<figcaption>` displays for the caption.
2.  If the image specifies an `aria-describedby` attribute, the content of the element whose ID is specified by the `aria-describedby`attribute displays for the caption.

*Examples: Using captions*
```html
<!-- Captions via figcaption -->
<figure>
  <amp-img on="tap:lightbox1"
      role="button"
      tabindex="0"
      src="dog.jpg"
      layout="responsive"
      width="300" height="246"></amp-img>
  <figcaption>Border Collie</figcaption>
</figure>

<!-- Captions via aria-describedby -->
<div>
  <amp-img on="tap:lightbox1"
      role="button"
      tabindex="0"
      src="dog.jpg"
      aria-describedby="imageDescription"
      layout="responsive"
      width="300" height="246"></amp-img>
   <div id="imageDescription">This is a border collie.</div>
</div>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>layout (required)</strong></td>
    <td>Must be set to <code>nodisplay</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>id (required)</strong></td>
    <td>The ID for the lightbox element that's used as a target for the image's <code>on</code> action.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-close-button-aria-label (optional)</strong></td>
    <td>An ARIA label that you can use for a close button.</td>
  </tr>
</table>


```html
<amp-image-lightbox id="image-lightbox1" layout="nodisplay"
    data-close-button-aria-label="Close"></amp-image-lightbox>
```

## Styling

You can style the `amp-image-lightbox` component with standard CSS. Some of the
properties that can be styled are `background` and `color`. The `amp-image-lightbox-caption` class is also available to style the caption
section.

## Actions

The `amp-image-lightbox` exposes the following actions you can use [AMP on-syntax to trigger](https://www.ampproject.org/docs/reference/amp-actions-and-events):

<table>
  <tr>
    <th width="20%">Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>open (default)</td>
    <td>Opens the image lightbox with the source image being the one that triggered the action.</td>
  </tr>
</table>

## Validation

See [amp-image-lightbox rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-image-lightbox/validator-amp-image-lightbox.protoascii) in the AMP validator specification.
