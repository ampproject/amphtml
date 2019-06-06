---
$category@: presentation
formats:
  - websites
teaser:
  text: Provides zooming and panning for arbitrary content.
---
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

# amp-pan-zoom

Provides zooming and panning for arbitrary content.

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a></td>
  </tr>
  <tr>
    <td><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-pan-zoom" src="https://cdn.ampproject.org/v0/amp-pan-zoom-0.1.js">&lt;/script></code></td>
  </tr>
    <tr>
    <td><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html#the-layout-attribute">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, responsive</td>
  </tr>
</table>

## Behavior

The `<amp-pan-zoom>` component takes one child of arbitrary content and enables the ability for the user to zoom and pan the content via double tap or pinch-to-zoom actions. Tap events registered on the zoomable content or its children will trigger after a 300ms delay.

## Usage

```html
<amp-layout layout="responsive" width="4" height="3">
  <amp-pan-zoom layout="fill">
    <svg>
    ...
    </svg>
  </amp-pan-zoom>
</amp-layout>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>max-scale (optional)</strong></td>
    <td>Specifies a max zoom scale, which should be a positive number from 1 - 9. The default value is 3.</td>
  </tr>
  <tr>
    <td width="40%"><strong>initial-scale (optional)</strong></td>
    <td>Specifies a default zoom scale, which should be a positive number from 1 - 9. The default value is 1.</td>
  </tr>
  <tr>
    <td width="40%"><strong>initial-x, initial-y (optional)</strong></td>
    <td>Specifies default translation coordinates, otherwise both are set to 0. The value is expected to be a whole number.</td>
  </tr>
  <tr>
    <td width="40%"><strong>reset-on-resize (optional)</strong></td>
    <td>Refers to the ability to center the image and set the image's scale back to 1. Setting this attribute causes the component to reset the zoomable content on resize of the image itself.</td>
  </tr>
  <tr>
    <td width="40%"><strong>controls (optional)</strong></td>
    <td>Shows default controls (zoom in / zoom out button) which can be customized via public CSS classes.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Events and actions

#### transformEnd (event)

The `<amp-pan-zoom>` component triggers the `transformEnd` event whenever the pan or zoom animation is complete. This event emits the `scale`, `x`, and `y` parameters. The `scale` parameter contains the current scale of the child content being zoomed. The `x` and `y` parameters contain the `x` and `y` translation of the child content from center in pixels, respectively.

#####  Example

This example contains an `amp-pan-zoom` component that will update `amp-state` on `transformEnd`.

```html
<amp-state id="transform">
  <script type="application/json">
    {
      "scale": 1,
      "y": 0,
      "x": 0
    }
  </script>
</amp-state>
<p [text]="'Current scale: ' + transform.scale + ', x: ' + transform.x + ', y: ' + transform.y">Current scale: 1</p>
<amp-pan-zoom layout="responsive" width="1" height="1" id="pan-zoom"
  on="transformEnd:AMP.setState({transform: {scale: event.scale, x: event.x, y: event.y}})">
  ...
</amp-pan-zoom>
```

#### transform (action)
The `transform` action takes `scale`, `x`, `y` as parameters and sets the CSS transform property of the child content. If no `x` or `y` value is specified, the content zooms to center.

##### Example

Assuming that there is an `<amp-pan-zoom>` component with the id `pan-zoom` on the page, a button with `on="tap:pan-zoom.transform(scale=3)"` will zoom to scale 3x at the center of the content, a button with `on="tap:pan-zoom.transform(scale=3, x=50, y=10)"` will first scale the content to 3x scale, and then shift the content 50 pixels towards the left, and 10 pixels upwards. Consider the `scale`, `x`, and `y` attributes directly applied to the content's CSS transform attribute after animation.

## Customizing Buttons

The following public CSS classes are exposed to allow customization for the zoom buttons:
```
.amp-pan-zoom-button
.amp-pan-zoom-in-icon
.amp-pan-zoom-out-icon
```
Use `.amp-pan-zoom-button` to customize the dimensions, positioning, background-color, border-radius of all buttons.
Use `.amp-pan-zoom-in-icon` to customize the icon for the zoom in button.
Use `.amp-pan-zoom-out-icon` to customize the icon for the zoom out button.
You can also hide these buttons entirely and create your own using the `transform` action. To hide them, just apply

```
.amp-pan-zoom-button {
  display: none;
}
```


## Validation
See [amp-pan-zoom rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-pan-zoom/validator-amp-pan-zoom.protoascii) in the AMP validator specification.

## Eligibile children tags
See the [list](https://github.com/ampproject/amphtml/blob/e517ee7e58215ea8baaa04fa5c6b09bba9581549/extensions/amp-pan-zoom/0.1/amp-pan-zoom.js#L47) of eligibles children tags of `amp-pan-zoom`.
