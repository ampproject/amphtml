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
    <td>Allows for a "lightbox” experience where upon user interaction, a ui component expands to fill the viewport until it is closed again by the user. Currently only images are supported. </td>
  </tr>
   <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a>; no validations yet.</div><div>Work in progress under the 'amp-lightbox-gallery' experiment flag.</div></td>
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

## Behavior
All you need to do is to include the 'lightbox' attribute on an `<amp-img>` or `<amp-carousel>`. A typical usage looks like this:

### Lightbox with AMP-IMG

```html
<amp-img src="image1" width=200 height=100 lightbox></amp-img>
<amp-img src="image2" width=200 height=100 lightbox></amp-img>
```

The `<amp-lightbox-gallery>` extension automatically inserts an invisible `<amp-lightbox-gallery>` component (with the id 'amp-lightbox-gallery') into the dom.

It iterates through each item that has the `lightbox` attribute and processes it. If the component is a basic item (e.g. `AMP-IMG`), it will install a tap handler on each basic lightboxed item (`on=tap:amp-lightbox-gallery.activate`) if a tap handler does not already exist. Currently, `<amp-img>` is the only type of basic item supported.

### Lightbox with AMP-CAROUSEL
```html
<amp-carousel lightbox width=1600 height=900 layout=responsive type=slides>
  <amp-img src="image1" width=200 height=100></amp-img>
  <amp-img src="image2" width=200 height=100></amp-img>
  <amp-img src="image3" width=200 height=100></amp-img>
</amp-carousel>
```

`<amp-carousel>` is considered a lightbox container item. To process an `<amp-carousel>` with the `lightbox` attribute,  `<amp-lightbox-gallery>` extension will iterate all of the `<amp-carousel>`'s children, add the `lightbox` attribute and a tap-handler to each child.

### Captions
Lightbox optionally allows the user to specify a caption for each element. These fields are automatically read and displayed by `<amp-lightbox-gallery>` in the following order of priority:
- figcaption (if the lightboxed element is a figure)
- aria-describedby
- alt
- aria-label
- aria-labelledby

