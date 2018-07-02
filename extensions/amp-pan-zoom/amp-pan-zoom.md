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

# <a name="amp-pan-zoom"></a> `amp-pan-zoom`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides a zoom and pan for arbitrary content</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a> only</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-pan-zoom" src="https://cdn.ampproject.org/v0/amp-pan-zoom-0.1.js">&lt;/script></code></td>
  </tr>
    <tr>
    <td width="40%"><strong>Supported Layouts</strong></td>
    <td>Fixed, Fixed Height, Fill, Responsive</td>
  </tr>
</table>

## Behavior
`<amp-pan-zoom>` takes one child of arbitrary content and enables zoom and pan of said child via double tap or pinch zoom. Tap events registered on the zoomable content or its children will trigger after a 300ms delay.

## Usage
```
<amp-layout layout="responsive" width="4" height="3">
      <amp-pan-zoom layout="fill">
        <svg>
        ...
        </svg>
    </amp-pan-zoom>
  </amp-layout>
```

## Attributes
##### max-scale (optional)
Specifies a max zoom scale, otherwise set to 3.

##### initial-scale (optional)
Specifies a default zoom scale, otherwise set to 1.

##### initial-x, initial-y (optional)
Specifies default translation coordinates, otherwise both set to 0. Expected to be a whole number.

##### reset-on-resize (optional)
Reset refers to centering the image and setting it back to scale = 1. Setting this attribute causes the component to reset the zoomable content on resize of the image itself.

## Events and Actions
#### transformEnd (event)
The `<amp-pan-zoom>` component triggers the `transformEnd` event whenever the pan or zoom animation is complete. This event will emit the parameters `scale`, `x`, and `y`. `scale` contains the current scale of the child content being zoomed. `x` and `y` respectively contain the `x` and `y` translation of the child content from center in pixels.

##### Example
This example contains an amp-pan-zoom component that will update `amp-state` on `transformEnd`.
```
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
We also have the `transform` action, which takes `scale`, `x`, `y` as paramters and sets the CSS transform property of the child content. If no `x` or `y` is specified, it zooms to center.

##### Example
Assuming that there is an `<amp-pan-zoom>` component with the id `pan-zoom` on the page, a button with `on="tap:pan-zoom.transform(scale=3)"` will zoom to scale 3x at the center of the content, a button with `on="tap:pan-zoom.transform(scale=3, x=50, y=10)"` will first scale the content to 3x scale, and then shift the content 50 pixels towards the left, and 10 pixels upwards. Consider the `scale`, `x`, and `y` attributes directly applied to the content's CSS transform attribute after animation.
