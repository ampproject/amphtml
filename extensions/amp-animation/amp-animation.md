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
```
<amp-animation layout="nodisplay">
<script type="application/json">
{
  // Timiing properties
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

### Animation component

Each animation component is a [keyframes effect](https://www.w3.org/TR/web-animations/#dom-keyframeeffect-keyframeeffect)
and is comprised of:
 - Target element referenced by ID
 - Timing properties
 - Keyframes

```
{
  "target": "element-id",
  // Timing properties
  ...
  "keyframes": []
}
```

### Timing properties

Top-level animation and animation components may contain timing properties. These properties are defined in detail in the
[AnimationEffectTimingProperties](https://www.w3.org/TR/web-animations/#dictdef-animationeffecttimingproperties) of the Web Animation spec. The set of properties allowed here includes:

Property | Type | Default | Description
-------- | ---- | ------- | -----------
`duration` | number | 0 | The animation duration in milliseconds
`delay` | number | 0 | The delay in milliseconds before animation starts executing
`endDelay` | number | 0 | The delay in milliseconds after animation completes and before it's actually considered to be complete
`iterations` | number or "Infinity" | 1 | The number of times to the animation effect repeats
`iterationStart` | number | 0 | The time offset at which the effect begins animating
`easing` | string | "linear" | The [timing function](https://www.w3.org/TR/web-animations/#timing-function) used to scale the time to produce easing effects
`direction` | string | "normal" | One of "normal", "reverse", "alternate" or "alternate-reverse"
`fill` | string | "none" | One of "none", "forwards", "backwards", "both", "auto"

An example of timing properties in JSON:
```
{
  ...
  "duration": 1000,
  "delay": 100,
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
```
{
  "keyframes": {"opacity": 0, "transform": "scale(2)"}
}
```

Shorthand object-form "from-to" format specifies the starting and final states at 0 and 100%:
```
{
  "keyframes": {
    "opacity": [1, 0],
    "transform": ["scale(1)", "scale(2)"]
  }
}
```

Shorthand object-form "value-array" format specifies multiple values for starting, final states and multiple (equal-spaced) offsets:
```
{
  "keyframes": {
    "opacity": [1, 0.1, 0],
    "transform": ["scale(1)", "scale(1.1)", "scale(2)"]
  }
}
```

The array-form specifies keyframes. Offsets are assigned automatically at 0, 100% and spaced evenly in-between:
```
{
  "keyframes": [
    {"opacity": 1, "transform": "scale(1)"},
    {"opacity": 0, "transform": "scale(2)"}
  ]
}
```

The array-form can also include "offset" explicitly:
```
{
  "keyframes": [
    {"opacity": 1, "transform": "scale(1)"},
    {"offset": 0.1, "opacity": 0.1, "transform": "scale(2)"},
    {"opacity": 0, "transform": "scale(3)"}
  ]
}
```

The array-form can also include "easing":
```
{
  "keyframes": [
    {"easing": "ease-out", "opacity": 1, "transform": "scale(1)"},
    {"opacity": 0, "transform": "scale(2)"}
  ]
}
```

For additional keyframes formats refer to [Web Animations spec](https://www.w3.org/TR/web-animations/#processing-a-keyframes-argument).


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
```
<amp-animation layout="nodisplay">
<script type="application/json">
{
  "target": "target1",
  "duration": 1000,
  "keyframes": {"opacity": 1}
}
</script>
</amp-animation>
```

If the animation is comprised of a list of components, but doesn't have top-level animation, the configuration
can be reduced to an array of components. For instance:
```
<amp-animation layout="nodisplay">
<script type="application/json">
[
  {
    "target": "target1",
    "duration": 1000,
    "keyframes": {"opacity": 1}
  },
  {
    "target": "target2",
    "duration": 600,
    "delay": 400,
    "keyframes": {"transform": "scale(2)"}
  }
]
</script>
</amp-animation>
```

## Triggering animation

The animation can be triggered via an `on` action. For instance:

```
<amp-animation id="anim1" layout="nodisplay"></amp-animation>
<button on="tap:anim1.activate">Animate</button>
```

More triggering mechanisms will be added in the future, including visibility triggers.

