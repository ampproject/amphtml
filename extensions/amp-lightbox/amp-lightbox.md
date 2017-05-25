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

# <a name="amp-lightbox"></a> `amp-lightbox`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Allows for a “lightbox” or similar experience where upon user interaction, a component expands to fill the viewport until it is closed again by the user.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-lightbox" src="https://cdn.ampproject.org/v0/amp-lightbox-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-lightbox/">Annotated code example for amp-lightbox</a></td>
  </tr>
</table>

## Behavior

The `amp-lightbox` component defines the child elements that will be displayed in a full-viewport overlay. It is triggered to take up the viewport when the user taps or clicks on an element with `on` attribute that targets `amp-lightbox` element’s `id`.

### Closing the lightbox
Pressing the escape key on the keyboard will close the lightbox.
Alternatively setting the `on` attribute on one or more elements within the lightbox and setting its method to `close` will close the lightbox when the element is tapped or clicked.

Example:
```html
<button on="tap:my-lightbox">Open lightbox</button>

<amp-lightbox id="my-lightbox" layout="nodisplay">
  <div class="lightbox">
    <amp-img src="my-full-image.jpg" width=300 height=800 on="tap:my-lightbox.close">
  </div>
</amp-lightbox>
```

## Styling

The `amp-lightbox` component can be styled with standard CSS.

## Actions
The `amp-lightbox` exposes the following actions you can use [AMP on-syntax to trigger](https://github.com/ampproject/amphtml/blob/master/spec/amp-actions-and-events.md):

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>open (default)</td>
    <td>Opens the lightbox</td>
  </tr>
  <tr>
    <td>close</td>
    <td>Closes the lightbox</td>
  </tr>
</table>

### Examples

```html
<button on="tap:tweets-lb">See Quote</button>
<amp-lightbox id="tweets-lb" layout="nodisplay">
    <blockquote>"Don't talk to me about JavaScript fatigue" - Horse JS</blockquote>
    <button on="tap:tweets-lb.close">Nice!</button>
</amp-lightbox>
```

## Attributes

**id** (required)

A unique identifer for the lightbox.

**layout**

Must be set to `nodisplay`.

**scrollable**

When `scrollable` attribute is present, the content of the lightbox can scroll
when overflowing the height of the lightbox.

## Validation

See [amp-lightbox rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-lightbox/0.1/validator-amp-lightbox.protoascii) in the AMP validator specification.
