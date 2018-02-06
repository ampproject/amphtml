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
</table>

## Overview

The `amp-lightbox-gallery` component provides a "lightbox” experience for AMP components (e.g., `amp-img`, `amp-carousel`). When the user interacts with the AMP element, a UI component expands to fill the viewport until it is closed by the user. Currently, only images are supported. 

## Usage

To use `amp-lightbox-gallery`, ensure the required script is included in your `<head>` section, then add the `lightbox` attribute on an `<amp-img>` or `<amp-carousel>` element. A typical usage looks like this:

### Lightbox with `<amp-img>`

```html
<amp-img src="image1" width=200 height=100 lightbox></amp-img>
<amp-img src="image2" width=200 height=100 lightbox></amp-img>
```

The `<amp-lightbox-gallery>` extension automatically inserts an invisible `<amp-lightbox-gallery>` component (with the id 'amp-lightbox-gallery') into the dom.

It iterates through each `<amp-img>` that has the `lightbox` attribute and installs a tap handler on it (`on=tap:amp-lightbox-gallery.activate`) if a tap handler does not already exist. Tapping on any `<amp-img>` will open the image in a lightbox gallery. The lightbox gallery does image-handling (e.g. zoom and pan), enables swiping to navigate between images, and offers a thumbnail gallery view for browsing all picture thumbnails in a grid.

### Lightbox with `<amp-carousel>`

```html
<amp-carousel lightbox width=1600 height=900 layout=responsive type=slides>
  <amp-img src="image1" width=200 height=100></amp-img>
  <amp-img src="image2" width=200 height=100></amp-img>
  <amp-img src="image3" width=200 height=100></amp-img>
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

