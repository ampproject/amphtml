---
$category@: layout
formats:
  - websites
teaser:
  text: Monitors the orientation of an element within the viewport as a user scrolls, and dispatches events that can be used with other AMP components.
---

# amp-orientation-observer

## Usage

The `amp-orientation-observer` component monitors the orientation of a device, and dispatches low-trust level events (`alpha`, `beta`, `gamma`) that report changes in the device's orientation along the `alpha`, `beta` and `gamma` axises in terms of `angle` and `percent`. These can be used to trigger actions (_Only Low Trust Actions_) on other components (e.g., [amp-animation](https://amp.dev/documentation/components/amp-animation)).

The `amp-orientation-observer` component is only useful when used with other components and does not do anything on its own.

Currently, [amp-animation](https://amp.dev/documentation/components/amp-animation) and several video players in AMP are the only components that allow low-trust events to trigger their actions (e.g., starting an animation, seeking to a position within the animation, pausing a video, etc.).

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
            {"transform": "rotate(-180deg)"},
            {"transform": "rotate(0deg)"}
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
    layout="nodisplay"
  >
  </amp-orientation-observer>
  <amp-img layout="responsive" width="2" height="1.5" src="./img/clock.jpg">
    <div class="clock-hand"></div>
  </amp-img>
</div>
```

## Attributes

### alpha-range (optional)

Specifies that the associated action should only take place for changes between the specified range along the z axis. Specified as a space separated list of 2 values (e.g., `alpha-range="0 180"`). By default, the related action is triggered for all changes between `0` and `360 degrees`.

### beta-range (optional)

Specifies that the associated action should only take place for changes between the specified range along the x axis. Specified as a space separated list of 2 values (e.g., `beta-range="0 180"`). By default, the related action is triggered for all changes between `0` and `360 degrees`.

_Example: Using beta-range to limit the range of degrees to watch along the x axis_

Imagine an animation where the hour hand of a clock rotates as the user scrolls the page.

```html
<amp-orientation-observer
  beta-range="0 180"
  on="beta:clockAnim1.seekTo(percent=event.percent)"
  layout="nodisplay"
>
</amp-orientation-observer>
```

### gamma-range (optional)

Specifies that the associated action should only take place for changes between the specified range along the y axis. Specified as a space separated list of 2 values (e.g., `gamma-range="0 90"`. By default the related action is triggered for all changes between `0` and `360 degrees`.

### smoothing (optional)

When enabled, outputs a moving average of the last `n` values instead of the raw value read from the sensor. By default, when activated, smoothing will be set to 4 points.

## Events

These are the low-trust level events that the `amp-orientation-observer` component dispatches:

### `alpha`

Represents the motion of the device around the z axis.

### `beta`

Represents the motion of the device around the x axis.

### `gamma`

Represents the motion of the device around the y axis. This represents a left to right motion of the device.

## Validation

See [amp-orientation-observer rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-orientation-observer/validator-amp-orientation-observer.protoascii) in the AMP validator specification.
