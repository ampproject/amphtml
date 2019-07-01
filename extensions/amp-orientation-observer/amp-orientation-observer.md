---
$category@: layout
formats:
  - websites
teaser:
  text: Monitors the orientation of an element within the viewport as a user scrolls, and dispatches events that can be used with other AMP components.
---
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

# amp-orientation-observer

Monitors the orientation of an element within the viewport as a user scrolls, and dispatches events that can be used with
other AMP components.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-orientation-observer" src="https://cdn.ampproject.org/v0/amp-orientation-observer-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/design/responsive/control_layout#the-layout-attribute">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://codepen.io/nainar92/project/full/XwzYOd/">CodePen project with samples</a>
    </td>
  </tr>
</table>

[TOC]

## Overview

The `amp-orientation-observer` component monitors the orientation of a device, and dispatches low-trust level events (`alpha`, `beta`, `gamma`) that report changes in the device's orientation along the `alpha`, `beta` and `gamma` axises in terms of `angle` and `percent`. These can be used to trigger actions (*Only Low Trust Actions*) on other components (e.g., [amp-animation](https://www.ampproject.org/docs/reference/components/amp-animation)).

{% call callout('Note', type='note') %}
The `amp-orientation-observer` component is only useful when used with other components and does not do anything on its own.
{% endcall %}


#### Events

These are the low-trust level events that the `amp-orientation-observer` component dispatches:


| Event    | Description                                            |
| ---------| -------------------------------------------------------|
| `alpha`  | Represents the motion of the device around the z axis. |
| `beta`   | Represents the motion of the device around the x axis. |
| `gamma`  | Represents the motion of the device around the y axis. This represents a left to right motion of the device. |


## What can I do with amp-orientation-observer?

Currently, [amp-animation](https://www.ampproject.org/docs/reference/components/amp-animation) and several video players in AMP are the only components that allow low-trust events to trigger their actions (e.g., starting an animation, seeking to a position within the animation, pausing a video, etc.).

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
    Use amp-orientation-observer to tie the movement of the clock scene within
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

##### alpha-range (optional)

Specifies that the associated action should only take place for changes between the specified range along the z axis. Specified as a space separated list of 2 values (e.g., `alpha-range="0 180"`). By default, the related action is triggered for all changes between `0` and `360 degrees`.

##### beta-range (optional)

Specifies that the associated action should only take place for changes between the specified range along the x axis. Specified as a space separated list of 2 values (e.g., `beta-range="0 180"`). By default, the related action is triggered for all changes between `0` and `360 degrees`.

*Example: Using beta-range to limit the range of degrees to watch along the x axis*

Imagine an animation where the hour hand of a clock rotates as the user scrolls the page.

```html
<amp-orientation-observer
  beta-range="0 180"
  on="beta:clockAnim1.seekTo(percent=event.percent)"
  layout="nodisplay">
</amp-orientation-observer>
```

##### gamma-range (optional)

Specifies that the associated action should only take place for changes between the specified range along the y axis. Specified as a space separated list of 2 values (e.g., `gamma-range="0 90"`. By default the related action is triggered for all changes between `0` and `360 degrees`.

## Validation

See [amp-orientation-observer rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-orientation-observer/validator-amp-orientation-observer.protoascii) in the AMP validator specification.
