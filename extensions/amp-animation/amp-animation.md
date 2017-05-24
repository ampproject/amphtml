<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-animation"></a> `amp-animation`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Animation component</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a>; no validations yet.</div><div>Work in progress.</div></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-animation" src="https://cdn.ampproject.org/v0/amp-animation-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
</table>

## Overview

AMP Animations rely on [Web Animations API](https://www.w3.org/TR/web-animations/) to define and run animations in AMP documents.


## Format

An `amp-animation` element defines such an animation as a JSON structure.

### Top-level animation specification

The top-level object defines an overall animation process which consists of an arbitrary number of animation components
defined as an `animations` array:
```html
<amp-animation layout="nodisplay">
<script type="application/json">
{
  // Timing properties
  ...
  "animations": [
    {
      // Animation 1
    },
    ...
    {
      // Animation N
    }
  ]
}
</script>
</amp-animation>
```

### Placement in DOM

Initially, `<amp-animation>` is only allowed to be placed as a direct child of `<body>` element. This restriction
will be removed in the near future.

### Animation component

Each animation component is a [keyframes effect](https://www.w3.org/TR/web-animations/#dom-keyframeeffect-keyframeeffect)
and is comprised of:
 - Target element(s) referenced by a selector
 - Media query
 - Timing properties
 - Keyframes

```text
{
  "selector": "#target-id",
  "media": "(min-width:300px)",
  // Timing properties
  ...
  "keyframes": []
}
```

### Media query

Media query can be specified using the `media` property. This attribute can contain any expression allowed
for [Window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) API.

If value is specified for an animation component, the animation component will only be included if the
media query will match the current environment.

### Timing properties

Top-level animation and animation components may contain timing properties. These properties are defined in detail in the
[AnimationEffectTimingProperties](https://www.w3.org/TR/web-animations/#dictdef-animationeffecttimingproperties) of the Web Animation spec. The set of properties allowed here includes:


<table>
  <tr>
    <th class="col-twenty">Property</th>
    <th class="col-twenty">Type</th>
    <th class="col-twenty">Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>duration</code></td>
    <td>time</td>
    <td>0</td>
    <td>The animation duration. Either a numeric value in milliseconds or a CSS time value, e.g. `2s`.</td>
  </tr>
  <tr>
    <td><code>delay</code></td>
    <td>time</td>
    <td>0</td>
    <td>The delay before animation starts executing. Either a numeric value in milliseconds or a CSS time value, e.g. `2s`.</td>
  </tr>
  <tr>
    <td><code>endDelay</code></td>
    <td>time</td>
    <td>0</td>
    <td>The delay after the animation completes and before it's actually considered to be complete. Either a numeric value in milliseconds or a CSS time value, e.g. `2s`.</td>
  </tr>
  <tr>
    <td><code>iterations</code></td>
    <td>number or<br>"Infinity" or<br>"infinite"</td>
    <td>1</td>
    <td>The number of times the animation effect repeats.</td>
  </tr>
  <tr>
    <td><code>iterationStart</code></td>
    <td>number/CSS</td>
    <td>0</td>
    <td>The time offset at which the effect begins animating.</td>
  </tr>
  <tr>
    <td><code>easing</code></td>
    <td>string</td>
    <td>"linear"</td>
    <td>The <a href="https://www.w3.org/TR/web-animations/#timing-function">timing function</a> used to scale the time to produce easing effects.</td>
  </tr>
  <tr>
    <td><code>direction</code></td>
    <td>string</td>
    <td>"normal" </td>
    <td>One of "normal", "reverse", "alternate" or "alternate-reverse".</td>
  </tr>
  <tr>
    <td><code>fill</code></td>
    <td>string</td>
    <td>"none"</td>
    <td>One of "none", "forwards", "backwards", "both", "auto".</td>
  </tr>
</table>

All timing properties allow either a direct numeric/string values or CSS values. For instance, "duration" can be specified as `1000` or `1s` or `1000ms`. In addition, CSS `calc()` and `var()` expressions are also allowed (see notes on `var()` in the section below).

An example of timing properties in JSON:
```text
{
  ...
  "duration": "1s",
  "delay": 100,
  "endDelay": "var(--end-delay, 10ms)",
  "easing": "ease-in",
  "fill": "both"
  ...
}
```

Animation components inherit timing properties specified for the top-level animation.

### Keyframes

Keyframes can be specified in numerous ways described in the [keyframes section](https://www.w3.org/TR/web-animations/#processing-a-keyframes-argument) of the Web Animations spec.

Some typical examples of keyframes definitions are below.

Shorthand object-form "to" format specifies the final state at 100%:
```text
{
  "keyframes": {"opacity": 0, "transform": "scale(2)"}
}
```

Shorthand object-form "from-to" format specifies the starting and final states at 0 and 100%:
```text
{
  "keyframes": {
    "opacity": [1, 0],
    "transform": ["scale(1)", "scale(2)"]
  }
}
```

Shorthand object-form "value-array" format specifies multiple values for starting, final states and multiple (equal-spaced) offsets:
```text
{
  "keyframes": {
    "opacity": [1, 0.1, 0],
    "transform": ["scale(1)", "scale(1.1)", "scale(2)"]
  }
}
```

The array-form specifies keyframes. Offsets are assigned automatically at 0, 100% and spaced evenly in-between:
```text
{
  "keyframes": [
    {"opacity": 1, "transform": "scale(1)"},
    {"opacity": 0, "transform": "scale(2)"}
  ]
}
```

The array-form can also include "offset" explicitly:
```text
{
  "keyframes": [
    {"opacity": 1, "transform": "scale(1)"},
    {"offset": 0.1, "opacity": 0.1, "transform": "scale(2)"},
    {"opacity": 0, "transform": "scale(3)"}
  ]
}
```

The array-form can also include "easing":
```text
{
  "keyframes": [
    {"easing": "ease-out", "opacity": 1, "transform": "scale(1)"},
    {"opacity": 0, "transform": "scale(2)"}
  ]
}
```

For additional keyframes formats refer to [Web Animations spec](https://www.w3.org/TR/web-animations/#processing-a-keyframes-argument).

The property values allow any valid CSS values, including `calc()` and `var()` expressions (see notes on `var()` in the section below).


#### Whitelisted properties for keyframes

Not all CSS properties can be used in keyframes. Only CSS properties that modern browsers can optimize and
animate quickly are whitelisted. This list will grow as more properties are confirmed to provide good
performance. Currently the list contains:
 - `opacity`
 - `transform`
 - `visibility`

Notice that the use of vendor prefixed CSS properties is neither needed nor allowed.


### Abbreviated forms of animation configuration

If the animation only involves a single element and a single keyframes effect is sufficient, the configuration
can be reduced to this one animation component only. For instance:
```html
<amp-animation layout="nodisplay">
<script type="application/json">
{
  "selector": "#target-id",
  "duration": "1s",
  "keyframes": {"opacity": 1}
}
</script>
</amp-animation>
```

If the animation is comprised of a list of components, but doesn't have top-level animation, the configuration
can be reduced to an array of components. For instance:
```html
<amp-animation layout="nodisplay">
<script type="application/json">
[
  {
    "selector": ".target-class",
    "duration": 1000,
    "keyframes": {"opacity": 1}
  },
  {
    "selector": ".target-class",
    "duration": 600,
    "delay": 400,
    "keyframes": {"transform": "scale(2)"}
  }
]
</script>
</amp-animation>
```

### `var()` and `calc()` expressions

`amp-animation` allows use of `var()` and `calc()` expressions.

For instance:
```html
<amp-animation layout="nodisplay">
<script type="application/json">
[
  {
    "selector": ".target-class",
    "duration": "4s",
    "delay": "var(--delay)",
    "keyframes": {"transform": "translateX(calc(100vh + 20px))"}
  }
]
</script>
</amp-animation>
```

Both `var()` and `calc()` polyfilled on platforms that do not directly support them. `var()` properties are extracted from the corresponding target elements. However, it's unfortunately impossible to fully polyfill `var()`. Thus, where compatibility is important, it's strongly recommended to include default values in the `var()` expressions. For instance:
```html
<amp-animation layout="nodisplay">
<script type="application/json">
[
  {
    "selector": ".target-class",
    "duration": "4s",
    "delay": "var(--delay, 100ms)",
  }
]
</script>
</amp-animation>
```


## Triggering animation

The animation can be triggered via a `trigger` attribute or an `on` action.

**`trigger` attribute**

Currently, `visibility` is the only available value for the `trigger` attribute. The `visibility` triggers when the underlying document or embed are visible (in viewport).

For instance:
```html
<amp-animation id="anim1" layout="nodisplay"
    trigger="visibility">
  ...
</amp-animation>
```

**`on` action**

For instance:

```html
<amp-animation id="anim1" layout="nodisplay">
  ...
</amp-animation>
<button on="tap:anim1.activate">Animate</button>
```
