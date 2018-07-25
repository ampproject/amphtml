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

##### animate-in (optional)

Defines the style of animation for opening the lightbox. By default, this will
be set to `fade-in`. Valid values are `fade-in`, `fly-in-bottom` and
`fly-in-top`.

⚠️ Note that the `fly-in-*` presets will modify the `transform` property of the
`amp-lightbox` element. Do not rely on transforming the `amp-lightbox` element
directly. If you need to apply a transform, set it on a nested element instead.

##### close-button (required on AMP4ADS)

Renders a close button header at the top of the lightbox. This attribute is only
required and valid when [using on AMP4ADS](#a4a).

##### id (required)

A unique identifer for the lightbox.

##### layout (required)

Must be set to `nodisplay`.

##### scrollable (optional)

When the `scrollable` attribute is present, the content of the lightbox can scroll when overflowing the height of the lightbox.

⚠️ Note that `scrollable` is not allowed when using `<amp-lightbox>` inside an AMP4ADS creative. [More information.](#a4a)


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

## <a id="a4a"></a> Using `amp-lightbox` in AMP4ADS

{% call callout('Read on', type='read') %}
`amp-lightbox` on AMP4ADS is experimental and under active development. [Turn on the `amp-lightbox-a4a-proto` experiment](http://cdn.ampproject.org/experiments.html) to use it.
{% endcall %}

There are a few differences using amp-lightbox in normal AMP documents vs. [ads written in AMP.](../amp-a4a/amp-a4a-format.md)

Mainly, the close-button attribute is required in AMP4ADS. This attribute will cause a header to be rendered at the top of your lightbox, which contains a close button and a label displaying "Ad". This enforcement has two reasons:

- Sets a consistent and predictable user-experience for AMP ads.

- Ensures that an exit point for the lightbox always exists, otherwise the creative could effectlively hijack the host document content via a lightbox.

The close-button attribute is required and only allowed in AMP4ADS. In regular AMP, you can render a close button wherever you need as part of the `<amp-lightbox>` content.

Secondly, scrollable lightboxes are not allowed in AMP4ADS.

The background of the `<body>` element for AMP4ADS documents containing a lightbox is also set to transparent. See below for more information.

### Transparent background

When using `<amp-lightbox>` in AMP4ADS, the background of your `<body>` element will become transparent. This is because the AMP runtime will resize and realign your creative's content before the lightbox gets expanded. This is done to prevent a visual "jump" of the creative while the lightbox opens. If your creative needs a background, set it on an intermediate container (like a full-size `<div>`) instead of the `<body>`.

When the ad is running in a 3p environment (for example, AMP inabox), the creative will be centered relative to the viewport and then expanded. This is because 3p iframes need to rely on a postMessage API in order to enable features like frame resizing, which is asynchronous, so centering the creative first allows us to employ a smooth transition without visual jumps.

Here we can see how the transition looks on the two different scenarios, with the attribute `animate-in="fly-in-bottom"` on the lightbox element.

#### On friendly iframes (e.g. coming from the AMP cache)

![](../../spec/img/lightbox-ad-fie.gif)

#### On 3p iframes (e.g. AMP inabox)

![](../../spec/img/lightbox-ad-3p.gif)

## Validation

See [amp-lightbox rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-lightbox/validator-amp-lightbox.protoascii) in the AMP validator specification.
