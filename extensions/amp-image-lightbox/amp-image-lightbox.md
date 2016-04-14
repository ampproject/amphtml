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

# <a name="amp-image-lightbox"></a> `amp-image-lightbox`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Allows for a “image lightbox” or similar experience where upon user interaction, an image expands to fill the viewport until it is closed again by the user.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-image-lightbox" src="https://cdn.ampproject.org/v0/amp-image-lightbox-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-image-lightbox">amp-image-lightbox.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/everything.amp.html">everything.amp.html</a></td>
  </tr>
</table>

## Behavior

The typical scenario looks like this:
```html
<amp-img
    on="tap:lightbox1"
    role="button"
    tabindex="0"
    src="image1" width=200 height=100></amp-img>
<amp-image-lightbox id="lightbox1" layout="nodisplay"></amp-image-lightbox>
```

The `amp-image-lightbox` is activated using `on` action on the `amp-img` element
by referencing the lightbox element's ID. When activated, it places the image in
the center of the full-viewport lightbox. Notice that any number of images in
the article can use the same `amp-image-lightbox`. The `amp-image-lightbox`
element itself must be empty and have `layout=nodisplay` set.

The `amp-image-lightbox` also can optionally display a caption for the image
at the bottom of the viewport. The caption is discovered as following:
 1. The contents of the `<figcaption>` element when image is in the `figure` tag.
 2. The contents of the element whose ID is specified by the image's
  `aria-describedby` attribute.

Among other things the `amp-image-lightbox` allows the following user manipulations:
zooming, panning, showing/hiding of the description.
Pressing the escape key on the keyboard will close the lightbox.

## Styling

The `amp-image-lightbox` component can be styled with standard CSS. Some of the
properties that can be styled are `background` and `color`.

The `amp-image-lightbox-caption` class is also available to style the caption
section.

## Validation errors

The following lists validation errors specific to the `amp-image-lightbox` tag
(see also `amp-image-lightbox` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-image-lightbox/0.1/validator-amp-image-lightbox.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">The 'example1' tag is missing or incorrect, but required by 'example2'.</a></td>
    <td>Error thrown when required <code>amp-image-lightbox</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>The only supported layout type is <code>NODISPLAY</code>. Error thrown if implied layout is any other value.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>The only supported layout type is <code>NODISPLAY</code>. Error thrown if specified layout is any other value.</td>
  </tr>
</table>
