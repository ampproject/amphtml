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

# <a name="amp-position-observer"></a> `amp-position-observer`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Monitors the position of an element within the viewport as a user scrolls, and dispatches <code>enter</code>, <code>exit</code> and <code>scroll</code> events that can be used with
    other components, such as <code>&lt;amp-animation>.</code>
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-position-observer" src="https://cdn.ampproject.org/v0/amp-position-observer-0.1.js">&lt;/script></code></td>
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

## What is amp-position-observer?
`amp-position-observer` is a functional component that monitors the position of an
element within the viewport as a user scrolls, and dispatches
`enter`, `exit` and `scroll:<Position In Viewport As a Percentage>` events (**Low Trust Level**)
which can be used to trigger actions (**Only Low Trust Actions**) on other components.

The `amp-position-observer` component is only useful when used with other components and does not do anything on its own.

## What can I do with amp-position-observer?

Currently [amp-animation](https://www.ampproject.org/docs/reference/components/amp-animation)
and several video players in AMP are the only components that allow low-trust events
to trigger their actions such as starting an animation, seeking to a position
within the animation, pausing a video, etc.

### Scroll-bound animations
The `amp-animation` component exposes a `seekTo` action that can be tied to the `scroll` event
of `amp-position-observer` to implement scroll-bound animations.

#### Example: Animation rotates as user scrolls
Imagine an animation where the hour hand of a clock rotates as the user scrolls
the page.

<amp-img alt="Scrollbound animation demo" layout="fixed" src="https://user-images.githubusercontent.com/2099009/29105493-e22a6500-7c82-11e7-9f5e-95c33c76f362.gif" width="304" height="540">
  <noscript>
    <img alt="Scrollbound animation demo" src="https://user-images.githubusercontent.com/2099009/29105493-e22a6500-7c82-11e7-9f5e-95c33c76f362.gif" />
  </noscript>
</amp-img>

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
  <amp-position-observer
    intersection-ratios="1"
    on="scroll:clockAnim.seekTo(percent=event.percent)"
    layout="nodisplay">
  </amp-position-observer>
  <amp-img layout="responsive" width=2 height=1.5 src="./img/clock.jpg">
    <div class="clock-hand"></div>
  </amp-img>
</div>

```

### Animation scenes that start/pause based on visibility in the viewport

The `amp-animation` component also exposes `start` and `pause` actions that can be tied to the
`enter` and `exit` events of `amp-position-observer` to control when an animation
starts/pauses based on visibility.

The `amp-position-observer` component exposes various visibility configurations such as
`intersection-ratios` and `viewport-margins` (similar to [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)) that
can be used to fine-tune when the target is considered visible.

#### Example: Animation starts and pauses based on visibility
Consider the same clock animation, but this time the hand animates with time, except
we like the animation to start when clock is at least 50% visible and pause as soon
as clock becomes less than 50% visible.

<amp-img alt="visibility demo" layout="fixed" src="https://user-images.githubusercontent.com/2099009/29105727-a7d9a80a-7c84-11e7-8d4a-794f38ea5a5c.gif" width="304" height="540">
  <noscript>
    <img alt="visibility demo" src="https://user-images.githubusercontent.com/2099009/29105727-a7d9a80a-7c84-11e7-8d4a-794f38ea5a5c.gif" />
  </noscript>
</amp-img>


```html
<!-- An animation that rotates a clock hand 180 degrees. -->
<!--
   Note that we are NOT setting `trigger=visibility`
   since we will manually trigger the animation
-->
<!--
   Also note that this is the same animation as the scroll-bound version above
   the animation is the same, just the triggering mechanism with
   `amp-position-observer` is different!
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
    Use amp-position-observer to tie the start/pause of the animation with
    the visibility of the scene.
  -->
  <amp-position-observer
    intersection-ratios="0.5"
    on="enter:clockAnim.start;exit:clockAnim.pause"
    layout="nodisplay">
  </amp-position-observer>

  <amp-img layout="responsive" width=2 height=1.5 src="./img/clock.jpg">
    <div class="clock-hand"></div>
  </amp-img>
</div>
```

## Attributes

#### target-id (optional)
Specifies the ID of the element to observe. If **not specified**, the **parent** of `<amp-position-observer>` is used as the target.

#### intersection-ratios (optional)

Defines how much of the target should be visible in the viewport before `<amp-position-observer>` triggers any of its events. The value is a number between 0 and 1 (default is 0).

You can specify different ratios for top vs. bottom by providing two values (`<top> <bottom>`).

- `intersection-ratios="0"` means `enter` is triggered as soon as a single pixel of the target comes into viewport and `exit` is triggered as soon as the very last pixel of the target goes out of the viewport.
- `intersection-ratios="0.5"` means `enter` is triggered as soon as 50% of the target comes into viewport and `exit` is triggered as soon as less than 50% of the target is in the viewport.
- `intersection-ratios="1"` means `enter` is triggered when target is fully visible and `exit` is triggered as soon as a single pixel goes out of the viewport.
- `intersection-ratios="0 1"` makes the conditions different depending on whether the target is entering/exiting from top (0 will be used) or bottom (1 will be used).


#### viewport-margins (optional)

A `px` or `vh` value which can be used to shrink the area of the viewport used for visibility calculations. A number without a unit will be assumed `px`. Defaults to 0.

You can specify different values for top vs. bottom by providing two values (`<top> <bottom>`).

- `viewport-margins="100px"` means shrink the viewport by 100px from the top and 100px from the bottom.
- `viewport-margins="25vh"` means shrink the viewport by 25% from the top and 25% from the bottom. Effectively only considering the middle 50% of the viewport.
- `viewport-margins="100px 10vh"` means shrink the viewport by 100px from the top and 10% from the bottom.

## Validation

See [amp-position-observer rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-position-observer/validator-amp-position-observer.protoascii) in the AMP validator specification.
