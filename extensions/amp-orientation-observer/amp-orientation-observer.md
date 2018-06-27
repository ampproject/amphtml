<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-orientation-observer"></a> `amp-orientation-observer`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Monitors the orientation of an element within the viewport as a user scrolls, and dispatches <code>enter</code>, <code>exit</code> and <code>scroll</code> events that can be used with
    other components, such as <code>&lt;amp-animation>.</code>
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-orientation-observer" src="https://cdn.ampproject.org/v0/amp-orientation-observer-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
      <ul>
        <li><a href="https://ampbyexample.com/visual_effects/basics_of_scrollbound_effects/">Basics of scrollbound effects tutorial</a></li>
        <li><a href="https://codepen.io/collection/nMJYrv/">CodePen collection with samples</a></li>
      </ul>
    </td>
  </tr>
</table>

[TOC]

## What is amp-orientation-observer?

`amp-orientation-observer` is a functional component that monitors the orientation of an the device, and dispatches `alpha`, `beta` and `gamma` events (Low Trust Level) which report changes in the device orientation along the `alpha`, `beta` and `gamma` axises in terms of `angle` and `percent`. These can be used to trigger actions (Only Low Trust Actions) on other components.

- The `alpha` event represents the motion of the device around the z axis.
- The `beta` event represents the motion of the device around the x axis.
- The `gamma` event represents the motion of the device around the y axis. This represents a left to right motion of the device.

The `amp-orientation-observer` component is only useful when used with other components and does not do anything on its own.

## What can I do with amp-orientation-observer?

Currently `amp-animation` and several video players in AMP are the only components that allow low-trust events to trigger their actions such as starting an animation, seeking to a position within the animation, pausing a video, etc.

### Scroll-bound animations

Imagine an animation where the hour hand of a clock rotates as the user scrolls the page.

```html
<!-- An animation that rotates a clock hand 180 degrees. -->
<!--
   Note that we are NOT setting `trigger=visibility`
   since we will manually trigger the animation.
-->
<amp-animation id="clockAnim" layout="nodisplay">
  <script type="application/json">
    {
    "duration": "3s",
    "fill": "both",
    "direction": "alternate",
    "animations": [
      {
        "selector": "#clock-scene .clock-hand",
        "keyframes": [
          { "transform": "rotate(-180deg)" },
          { "transform": "rotate(0deg)" }
        ]
      }
    ]
  }
  </script>
</amp-animation>

<!-- The clock container -->
<div id="clock-scene">
  <!--
    Use amp-position-observer to tie the movement of the clock scene within
    the viewport to the timeline of the animation
  -->
  <amp-orientation-observer
    on="beta:clockAnim1.seekTo(percent=event.percent)"
    layout="nodisplay">
  </amp-orientation-observer>
  <amp-img layout="responsive" width=2 height=1.5 src="./img/clock.jpg">
    <div class="clock-hand"></div>
  </amp-img>
</div>

```

## Attributes

### alpha-range (optional)

Specifies that the associated action should only take place for changes between the specified range along the z axis. Specified as a space separated list of 2 values e.g. `alpha-range="0 180"`. By default the related action is triggered for all changes between `0` and `360 degrees`.

### beta-range (optional)

Specifies that the associated action should only take place for changes between the specified range along the x axis. Specified as a space separated list of 2 values e.g. `beta-range="0 180"`. By default the related action is triggered for all changes between `0` and `360 degrees`.

#### Example: Limit the range of degrees to watch along the x axis.

Imagine an animation where the hour hand of a clock rotates as the user scrolls the page.

```html
<amp-orientation-observer
  beta-range="0 180"
  on="beta:clockAnim1.seekTo(percent=event.percent)"
  layout="nodisplay">
</amp-orientation-observer>
```

### gamma-range (optional)

Specifies that the associated action should only take place for changes between the specified range along the y axis. Specified as a space separated list of 2 values e.g. `gamma-range="0 90"`. By default the related action is triggered for all changes between `0` and `360 degrees`.

## Validation

See [amp-orientation-observer rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-orientation-observer/validator-amp-orientation-observer.protoascii) in the AMP validator specification.
