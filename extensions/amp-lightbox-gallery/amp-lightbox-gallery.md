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

# <a name="amp-lightbox-gallery"></a> `amp-lightbox-gallery`
[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides a "lightbox” experience. Upon user interaction, a UI component expands to fill the viewport until it is closed by the user.</td>
  </tr>
   <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a>; no validations yet.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-lightbox-gallery" src="https://cdn.ampproject.org/v0/amp-lightbox-gallery-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-lightbox-gallery/">amp-lightbox-gallery</a> sample.</td>
  </tr>
</table>

## Overview

The `amp-lightbox-gallery` component provides a "lightbox” experience for AMP components (e.g., `amp-img`, `amp-carousel`). When the user interacts with the AMP element, a UI component expands to fill the viewport until it is closed by the user. Currently, only images are supported.

## Usage

To use `amp-lightbox-gallery`, ensure the required script is included in your `<head>` section, then add the `lightbox` attribute on an `<amp-img>` or `<amp-carousel>` element. A typical usage looks like this:

### Lightbox with `<amp-img>`

```html
<amp-img src="cat.jpg" width="100" height="100" lightbox></amp-img>
<amp-img src="dog.jpg" width="100" height="100" lightbox></amp-img>
<amp-img src="bird.jpg" width="100" height="100" lightbox></amp-img>
```

Tapping on any `<amp-img>` opens the image in a lightbox gallery. The lightbox gallery does image-handling (e.g., zoom and pan), enables swiping to navigate between images, and offers a thumbnail gallery view for browsing all picture thumbnails in a grid.

### Lightbox with `<amp-carousel>`

```html
<amp-carousel lightbox width="1600" height="900" layout="responsive" type="slides">
  <amp-img src="image1" width="200" height="100"></amp-img>
  <amp-img src="image1" width="200" height="100"></amp-img>
  <amp-img src="image1" width="200" height="100"></amp-img>
</amp-carousel>
```

You can add the `lightbox` attribute on an `<amp-carousel>` to lightbox all of its children. Currently, the `<amp-lightbox-gallery>` component only supports carousels containing `<amp-img>` as children. As you navigate through the carousel items in the lightbox, the original carousel slides are synchronized so that when the lightbox is closed, the user ends up on the same slide as the were originally on. Currently, only the `type='slides'` carousel is supported.

### Captions

Optionally, you can specify a caption for each element in the lightbox. These fields are automatically read and displayed by the `<amp-lightbox-gallery>` in the following order of priority:

- `figcaption` (if the lightboxed element is the child of a figure)
- `aria-describedby`
- `alt`
- `aria-label`
- `aria-labelledby`

#### Example 1: Using figcaption for description

In this example, `<amp-lightbox-gallery>` displays the `figcaption` value as its description, showing "Toront's CN tower was ....".

```html
<figure>
  <amp-img id="hero-img" lightbox="toronto" src="https://picsum.photos/1600/900?image=1075" layout="responsive" width="1600"
    height="900" alt="Picture of CN tower.">
  </amp-img>
  <figcaption class="image">
    Toronto's CN tower was built in 1976 and was the tallest free-standing structure until 2007.
  </figcaption>
</figure>
```

#### Example 2: Using alt for description

In this example, `<amp-lightbox-gallery>` displays the `alt` value as its description, showing "Picture of CN tower".
```html
<amp-img
  id="hero-img"
  lightbox="toronto"
  src="https://picsum.photos/1600/900?image=1075"
  layout="responsive"
  width="1600"
  height="900"
  alt="Picture of CN tower">
</amp-img>
```

## Thumbnail API
Lightboxed items have a thumbnail gallery view. You can optionally specify a thumbnail item for your lightboxed element via the attribute `lightbox-thumbnail-id` that references the `id` of an `<amp-img>` element with `layout="nodisplay"`.

#### Example: using `lightbox-thumbnail-id` to specify a thumbnail

```html
<amp-facebook
  lightbox
  lightbox-thumbnail-id="fb-thumbnail-img"
  width="552"
  height="303"
  layout="responsive"
  data-href="https://www.facebook.com/zuck/posts/10102593740125791">
</amp-facebook>

<amp-img id="fb-thumbnail-img"
  width="200"
  height="200"
  layout="nodisplay"
  src="https://picsum.photos/200/200?image=1074">
</amp-img>
```

If no thumbnail is specified, `<amp-img>` elements will be cropped per `object-fit: cover`, `<amp-video>` will use the image src specified in its `poster` attribute, and placeholder images will be used for lightboxed elements that have one.

## CSS API

The CSS API exposes the following CSS classes so that you can customize the style of your lightbox:

<table>
  <tr>
    <th width="40%">CSS class</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>.amp-lbg-mask</code></td>
    <td>Use to customize the background color and opacity for the lightbox.</td>
  </tr>
   <tr>
    <td><code>.amp-lbv-desc-box.standard</code>,<code>.amp-lbv-desc-box.overflow</code></td>
    <td>Use to customize the description box's background color and gradient.</td>
  </tr>
  <tr>
    <td><code>.amp-lbg-top-bar</code></td>
    <td>Use to customize the color and gradient for the lightbox's top controls bar.</td>
  </tr>
    <td><code>.amp-lbv-desc-text</code></td>
    <td>Use to customize the font and colors for the description.</td>
  </tr>
  <tr>
    <td><code>.amp-lbg-icon</code></td>
    <td>Use to customize the icon colors.</td>
  </tr>
  <tr>
    <td><code>.amp-lbg-button-close</code>,<code>.amp-lbg-icon</code></td>
    <td>Use to customize the icon for the close button.</td>
  </tr>
  <tr>
    <td><code>.amp-lbg-button-gallery</code>,<code>.amp-lbg-icon</code></td>
    <td>Use to customize the icon for the gallery button.</td>
  </tr>
    <tr>
    <td><code>.amp-lbg-button-slide</code>,<code>.amp-lbg-icon</code></td>
    <td>Use to customize the icon for the slide button.</td>
  </tr>
</table>

#### Example: Using CSS to invert lightbox colors

The following example uses the CSS API to set the lightbox background to white and the icon colors to black.

```html
.amp-lbg-mask {
  opacity: 0.9;
  background-color: rgba(255, 255, 255, 1);
}

.amp-lbv-desc-box.standard, .amp-lbv-desc-box.overflow {
  background: linear-gradient(transparent,rgba(255, 255, 255, 0.5));
  color: #000000;
}

.amp-lbg-top-bar {
  background: linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0));
}

.amp-lbg-icon {
  background-color: #000000;
}

.amp-lbv-desc-text {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
```
