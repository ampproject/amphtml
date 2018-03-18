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
    <td>Displays elements in a full-viewport “lightbox” modal.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-lightbox" src="https://cdn.ampproject.org/v0/amp-lightbox-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-lightbox/">amp-lightbox</a> sample.</td>
  </tr>
</table>

[TOC]

## Behavior

The `amp-lightbox` component defines child elements that display in a full-viewport overlay/modal. When the user taps or clicks an element (e.g., a button), the `amp-lightbox` ID referenced in the clicked element's `on` attribute triggers the lightbox to take up the full viewport and displays the child elements of the `amp-lightbox`.

Pressing the escape key on the keyboard closes the lightbox. Alternatively, setting the `on` attribute on one or more elements within the lightbox and setting its method to `close` closes the lightbox when the element is tapped or clicked.

```html
<button on="tap:quote-lb">See Quote</button>
<amp-lightbox id="quote-lb" layout="nodisplay">
    <blockquote>"Don't talk to me about JavaScript fatigue" - Horse JS</blockquote>
    <button on="tap:quote-lb.close">Nice!</button>
</amp-lightbox>
```

{% call callout('Read on', type='read') %}
For showing images in a lightbox, there's also the [`<amp-image-lightbox>`](https://www.ampproject.org/docs/reference/components/amp-lightbox) component.
{% endcall %}


## Attributes

##### id (required)

A unique identifer for the lightbox.

##### layout (required)

Must be set to `nodisplay`.

##### scrollable (optional)

When the `scrollable` attribute is present, the content of the lightbox can scroll when overflowing the height of the lightbox.

## Styling

You can style the `amp-lightbox` with standard CSS.

## Actions
The `amp-lightbox` exposes the following actions you can use [AMP on-syntax to trigger](https://www.ampproject.org/docs/reference/amp-actions-and-events):

<table>
  <tr>
    <th width="20%">Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>open</code> (default)</td>
    <td>Opens the lightbox.</td>
  </tr>
  <tr>
    <td><code>close</code></td>
    <td>Closes the lightbox.</td>
  </tr>
</table>

## Validation

See [amp-lightbox rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-lightbox/validator-amp-lightbox.protoascii) in the AMP validator specification.
