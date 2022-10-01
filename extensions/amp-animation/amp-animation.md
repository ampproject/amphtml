---
$category@: presentation
formats:
  - websites
  - ads
teaser:
  text: Defines and displays an animation.
---

# amp-animation

## Usage

The `amp-animation` component defines and runs custom animations and effects. It
relies on the [Web Animations API](https://www.w3.org/TR/web-animations/).

An `amp-animation` component defines animations in a JSON structure. The
top-level section defines the overarching animation by declaring target
element(s), execution conditions, timing properties and
[keyframes effect](https://www.w3.org/TR/web-animations/#dom-keyframeeffect-keyframeeffect).
The overarching process can contain any arbitrary number of animation parts
defined within the `animations` array. Animation parts in the animation's array
may have their own target elements, execution conditions, timing properties, and
keyframes effects.

```html
<amp-animation layout="nodisplay">
  <script type="application/json">
    {
      "selector": "#target-id",
      "duration": "1s",
      "iterations": "4",
      "fill": "both",
      "direction": "alternate",
      "animations": [
        {
          "selector": ".target-class",
          "easing": "cubic-bezier(0,0,.21,1)",
          "keyframes": {
            "transform": "rotate(20deg)"
          }
        },
        {
          "delay": "2s",
          "easing": "cubic-bezier(0,0,.21,1)",
          "keyframes": {
            "transform": "rotate(30deg)"
          }
        }
      ]
    }
  </script>
</amp-animation>
```

If the animation uses a single element and a single keyframes effect, the
configuration is valid as a single animation definition.

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

If the animation uses multiple elements, but does not have a top-level
animation, the configuration is valid as an array of definitions.

```html
<amp-animation layout="nodisplay">
  <script type="application/json">
    [
      {
        "selector": ".target1",
        "duration": 1000,
        "keyframes": {"opacity": 1}
      },
      {
        "selector": ".target2",
        "duration": 600,
        "delay": 400,
        "keyframes": {"transform": "scale(2)"}
      }
    ]
  </script>
</amp-animation>
```

Trigger the start of one or multiple animations via the `trigger` attribute or
an [action](#actions).

You may place `amp-animation` controlled via actions anywhere in the DOM. If the
animation contains `trigger="visibility"` it will be triggered when
the parent element comes into the viewport, and paused when it leaves the
viewport.

### Defining effects

#### Keyframes

You must declare effects as keyframes to apply animations using
`amp-animations`.

You may specify keyframes in amp-animation in the same way as defined in MDN's
[Keyframe Formats](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats).
You may also reference the `@keyframes` name defined as CSS within the
`<style amp-custom>` or `<style amp-keyframes>` tag.

Some typical examples of keyframes definitions are below.

Shorthand object-form "to" format specifies the final state at 100%:

```text
{
  "keyframes": {"opacity": 0, "transform": "scale(2)"}
}
```

Shorthand object-form "from-to" format specifies the starting and final states
at 0 and 100%:

```text
{
  "keyframes": {
    "opacity": [1, 0],
    "transform": ["scale(1)", "scale(2)"]
  }
}
```

Shorthand object-form "value-array" format specifies multiple values for
starting, final states and multiple (equal-spaced) offsets:

```text
{
  "keyframes": {
    "opacity": [1, 0.1, 0],
    "transform": ["scale(1)", "scale(1.1)", "scale(2)"]
  }
}
```

The array-form specifies keyframes. Offsets are assigned automatically at 0,
100% and spaced evenly in-between:

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

Using the `@keyframes` CSS rule:

```html
<style amp-custom>
  @keyframes keyframes1 {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>

<amp-animation layout="nodisplay">
  <script type="application/json">
    {
      "duration": "1s",
      "keyframes": "keyframes1"
    }
  </script>
</amp-animation>
```

Most CSS `@keyframes` match the JSON inline keyframes definition in the
[Web Animations spec](https://www.w3.org/TR/web-animations/#processing-a-keyframes-argument)
with the following nuances:

-   You may need vendor prefixes, such as `@-ms-keyframes {}` or
    `-moz-transform` for broad-platform support. Vendor prefixes are not needed
    and not allowed in the JSON format, but in CSS they could be necessary.

-   In unsupported platforms, `amp-animation`'s polyfills will fail when using
    `calc()` and `var()` with keyframes specified in CSS. Use fallback values in
    CSS to avoid this.

-   CSS extensions such as `width()`, `height()`, `x()`, `y()`, `num()`,
    `rand()`, `index()`, and `length()` are not available to `@keyframes`.

##### On `prefers-reduced-motion`

Oftentimes, a running animation will finalize by putting an element in a visible state, and initial CSS will hide the element to depend on the animation finalizing later.

Users may configure their devices to [use reduced animation](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion). With this option, animations will not run at all. In this case, you need to disable CSS properties that depend on an animation runnning later.

You can use a media query for this purpose. In the following example, an `<amp-animation>` would later animate the element into visibility by setting `opacity: 1`. When animations are disabled, the element is always visible:

```html
<style amp-custom>
  .my-hidden-element {
    opacity: 1;
  }
  @media not (prefers-reduced-motion) {
    .my-hidden-element {
      opacity: 0;
    }
  }
</style>
<amp-animation layout="nodisplay">
  <script type="application/json">
    [
      {
        "selector": ".my-hidden-element",
        "duration": "1s",
        "keyframes": {"opacity": 1}
      }
    ]
  </script>
</amp-animation>
```

##### Allowed properties for keyframes

The amp-animation component restricts CSS allowable properties to optimize
performance. Below is the allow-listed properties:

-   [`opacity`](https://developer.mozilla.org/en-US/docs/Web/CSS/opacity)
-   [`transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
-   [`visibility`](https://developer.mozilla.org/en-US/docs/Web/CSS/visibility)
-   [`offset-distance`](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-distance)
-   [`clip-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path).
    Only supported values are `inset()`, `circle()`, `ellipse()`, and
    `polygon()`.

Use of vendor prefixed CSS properties is neither needed nor allowed.

#### Timing properties

Top-level animation and animation components may contain timing properties.
Below is the allowed set of properties:

<table>
  <thead>
    <tr>
      <th class="col-twenty">Property</th>
      <th class="col-twenty">Type</th>
      <th class="col-twenty">Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>duration</code></td>
      <td>time</td>
      <td>0</td>
      <td>The animation duration. Either a numeric value in milliseconds or a
        CSS time value, e.g. <code>2s</code>.</td>
    </tr>
    <tr>
      <td><code>delay</code></td>
      <td>time</td>
      <td>0</td>
      <td>The delay before animation starts executing. Either a numeric value in
        milliseconds or a CSS time value, e.g. <code>2s</code>.</td>
    </tr>
    <tr>
      <td><code>endDelay</code></td>
      <td>time</td>
      <td>0</td>
      <td>The delay after the animation completes and before it's actually
        considered to be complete. Either a numeric value in milliseconds or a
        CSS time value, e.g. <code>2s</code>.</td>
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
      <td>The <a href="https://www.w3.org/TR/web-animations/#timing-function">timing
        function</a> used to scale the time to produce easing effects.</td>
    </tr>
    <tr>
      <td><code>direction</code></td>
      <td>string</td>
      <td>"normal"</td>
      <td>One of "normal", "reverse", "alternate" or "alternate-reverse".</td>
    </tr>
    <tr>
      <td><code>fill</code></td>
      <td>string</td>
      <td>"none"</td>
      <td>One of "none", "forwards", "backwards", "both", "auto".</td>
    </tr>
  </tbody>
</table>

All timing properties allow either a direct numeric/string values or CSS values.
For instance, `1000` or `1s` or `1000m` are all valid values for `duration`.

An example of timing properties in JSON:

```JSON
{
  ...
  "duration": "1s",
  "delay": 100,
  "easing": "ease-in",
  "fill": "both"
  ...
}
```

Animation components inherit timing properties specified for the top-level
animation.

#### Variables and calculated expressions

`amp-animation` allows use of `var()`, `calc()`, `min()`, and `max()`
expressions for timing and keyframes values.

```html
<amp-animation layout="nodisplay">
  <script type="application/json">
    [
      {
        "selector": ".target-class",
        "duration": "4s",
        "delay": "var(--delay)",
        "--y": "var(--other-y, 100px)",
        "keyframes": {"transform": "translate(calc(100vh + 20px), var(--y))"}
      }
    ]
  </script>
</amp-animation>
```

You may declare CSS variables to use for timing and keyframe values via
the `var()` expressions.

CSS variables are available to nested animations, but nested animations
may override the variable's value.

```html
<amp-animation layout="nodisplay">
  <script type="application/json">
    {
      "--delay": "0.5s",
      "--x": "100px",
      "animations": [
        {
          "selector": "#target1",
          "delay": "var(--delay)",
          "--x": "150px",
          "keyframes": {"transform": "translate(var(--x), var(--y, 0px)"}
        },
        ...
      ]
    }
  </script>
</amp-animation>
```

In the example above:

-   The nested animation applies the var `--delay` to the delay of
    `#target1` animation.

-   While `--x` propagates into the nested animation, it is overridden.
    The ending translate value is `150px`.

-   `--y` is not specified anywhere in the `<amp-animation>` component.
    It defaults to `0px` if the query does not find it defined as CSS
    within the `<amp style-custom>` tags.

Polyfills apply to both `var()` and `calc()` on supported platforms. As
a best practice, include default values for `var()`.

```html
<amp-animation layout="nodisplay">
  <script type="application/json">
    [
      {
        "selector": ".target-class",
        "duration": "4s",
        "delay": "var(--delay, 100ms)"
      }
    ]
  </script>
</amp-animation>
```

Override variables of target elements specified in the
`<style amp-custom>` tag by using `--var-name` fields in `amp-animation`
component. `var()` expressions first try to resolve values specified
within the animation component and then resolve target styles.

#### CSS extensions

The `amp-animation` component provides the following CSS extensions:
`rand()`, `num()`, `width()`, `height()`, `x()`, and `y()`. The allowed
CSS extensions are valid everywhere where CSS values are usable within
the `amp-animation` definition. This includes timing and keyframes
values.

##### CSS `index()` extension

The `index()` function returns an index of the current target element in
the animation effect. This is most relevant when animating multiple
targets with the same effect using `selector` property. The first target
matched by the `selector` will have `index 0`, the second will have
`index 1` and so on.

Among other uses, this property can combine with `calc()` expressions to
create a staggered effect. For instance:

```json
{
  "selector": ".class-x",
  "delay": "calc(200ms * index())"
}
```

##### CSS `length()` extension

The `length()` function returns the number of target elements in the
animation effect. This is most relevant when combined with `index()`:

```json
{
  "selector": ".class-x",
  "delay": "calc(200ms * (length() - index()))"
}
```

##### CSS `rand()` extension

The `rand()` function returns a random CSS value. There are two forms.

The form without arguments returns the random number between 0 and 1.

```json
{
  "delay": "calc(10s * rand())"
}
```

The second form has two arguments and returns the random value between
these two arguments.

```json
{
  "delay": "rand(5s, 10s)"
}
```

##### CSS `width()`, `height()`, `x()` and `y()` extensions

The `width()`/`height()` and `x()`/`y()` extensions return the size or
coordinates of the animated element or the element specified by the selector.
The returned value is in pixels, e.g. `100px`.

`amp-animation` supports the following forms:

-   `width()`, `height()`, `x()`, `y()` - width/height or coordinates of the
    animated element.

-   With a selector, such as `width('.selector')` or `x('.selector')` - dimension
    or coordinate of the element specified by the selector. Any CSS selector is
    usable. For instance, `height('#container > li')`.

-   With a closest selector, such as `height(closest('.selector'))` or
    `y(closest('.selector'))` - dimension or coordinate of the element specified
    by the closest selector.

The `width()` and `height()` are especially useful for transforms. The `left`,
`top` and similar CSS properties that can use `%` values to express animations
proportional to container size. However, `transform` property interprets `%`
values differently - as a percent of the selected element. Thus, the `width()`
and `height()` can be used to express transform animations in terms of container
elements and similar.

These functions can be combined with `calc()`, `var()` and other CSS
expressions. For instance:

```json
{
  "transform": "translateX(calc(width('#container') + 10px))"
}
```

##### CSS `num()` extension

The `num()` function returns a number representation of a CSS value. For
instance:

-   `num(11px)` yields `11`;
-   `num(110ms)` yields `110`;
-   etc.

For instance, the following expression calculates the delay in seconds
proportional to the element's width:

```json
{
  "delay": "calc(1s * num(width()) / 100)"
}
```

#### Override effects on subtargets

Override timing properties or variables defined in the top-level animation with
subtargets. Define subtargets via `subtargets: []` where desired, in the same
space as valid `selector`s. Specify a subtarget by index or a CSS selector.

```json
{
  "selector": ".target",
  "delay": 100,
  "--y": "100px",
  "subtargets": [
    {
      "index": 0,
      "delay": 200
    },
    {
      "selector": ":nth-child(2n+1)",
      "--y": "200px"
    }
  ]
}
```

In the example above:

-   The top-level animation defaults targets matched by `".target"` to a delay
    of `100` and `"--y"` of `100px`.

-   `"subtargets": []` includes the first target, `"index": 0`. This definition
    overrides the default delay of `100` to `200`.

-   `"subtargets": []` includes `"selector": ":nth-child(2n+1)"`. This
    definition overrides the `--y` variable's default value of `100px` to
    `200px`.

Multiple subtargets can match one target `selector` element.

### SVG animations

SVGs are awesome and we recommend their use for animations!

The `amp-animation` component supports SVG animations with the allowed listed
CSS keyframe properties, with the following nuances:

-   IE/Edge SVG elements
    [do not support CSS `transform` properties](https://stackoverflow.com/questions/34434005/svg-transform-property-not-taking-acount-in-ie-edge).
    While the `transform` animation itself is polyfilled, the initial state
    defined in a stylesheet is not applied. If the initial transformed state is
    important on IE/Edge, it's recommended to duplicate it via
    [SVG `transform` attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform).

-   It is impossible to polyfill `transform-origin` for IE/Edge. For
    compatibility, use only the default `transform-origin`.

-   Use [CSS `transform-box`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-box)
    to avoid `transform-origin` interpretation problems. See issues for
    [Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=740300),
    [Safari](https://bugs.webkit.org/show_bug.cgi?id=174285), and
    [Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1379340).

### Compatibility and fallbacks

Use media queries, support conditions and switch statements for platform
compatibility and fallback options.

#### Media queries

Specify media queries with the `media` property. This property can contain any
expression allowed for
[Window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
API and corresponds to `@media` CSS rule.

When specified, the animation component will only execute when the environment
supports the specified CSS feature.

#### Supports condition

Specify supports conditions using the `supports` property. The `supports`
property contains any expression allowed for
[`CSS.supports`](https://developer.mozilla.org/en-US/docs/Web/API/CSS/supports)
API and corresponds to `@supports` CSS rule.

When specified, the animation component will only execute when the environment
supports the specified CSS feature.

### Animation `switch` statement

In some cases, you may need to combine conditional animations with an optional
default into a single animation. Use the `switch` animation statement to define
the conditions.

```json
{
  // Optional selector, vars, timing
  ...
  "switch": [
    {
      "media": "(min-width: 320px)",
      "keyframes": {...},
    },
    {
      "supports": "offset-distance: 0",
      "keyframes": {...},
    },
    {
      // Optional default: no conditionals
    }
  ]
}
```

The `amp-animation` component evaluates `switch` animation definitions in the
defined order. It executes the first animation to match the condition and
ignores the rest.

In the example below, the animation runs motion-path animation if supported and
falls back to transform:

```json
{
  "selector": "#target1",
  "duration": "1s",
  "switch": [
    {
      "supports": "offset-distance: 0",
      "keyframes": {
        "offsetDistance": [0, "300px"]
      }
    },
    {
      "keyframes": {
        "transform": [0, "300px"]
      }
    }
  ]
}
```

### Combine and split animations

Animations defined in `amp-animation` can reference each other. This ability
allows combining multiple `amp-animation` declarations into a single animation.
Splitting up animations into different `amp-animation` components allows the
reuse of smaller animations, while enabling the same effect as nesting.

```html
<amp-animation id="anim1" layout="nodisplay">
  <script type="application/json">
    {
      "animation": "anim2",
      "duration": 1000,
      "--scale": 2
    }
  </script>
</amp-animation>

<amp-animation id="anim2" layout="nodisplay">
  <script type="application/json">
    {
      "selector": ".target-class",
      "keyframes": {"transform": "scale(var(--scale))"}
    }
  </script>
</amp-animation>
```

The example animation above combines `"anim2"` animation as part of `"anim1"`.
The `"anim2"` does not require a `selector` target. In such case, the included
animation references its own target.

Another form allows the including animation to provide the target or multiple
targets. In that case, the included animation executes for each matched target.

```html
<amp-animation id="anim1" layout="nodisplay">
  <script type="application/json">
    {
      "selector": ".target-class",
      "animation": "anim2",
      "duration": 1000,
      "--scale": 2
    }
  </script>
</amp-animation>

<amp-animation id="anim2" layout="nodisplay">
  <script type="application/json">
    {
      "keyframes": {"transform": "scale(var(--scale))"}
    }
  </script>
</amp-animation>
```

In the example above, `"anim2"` executes for each matched `".target-class"`.
Variables and timing properties specified in the caller animation pass to the
combined animation.

#### Triggering via on action

For instance:

```html
<amp-animation id="anim1" layout="nodisplay">
  ...
</amp-animation>
<button on="tap:anim1.start">Animate</button>
```

### Accessibility considerations for animations

If you are using animations to convey meaning or content, make sure that this is also conveyed in some other form for users who may not be able to see those animations. At the most basic level, make sure that your text content conveys the same information as the animation. For instance, if you're using an `<amp-animation>` to illustrate a sequence of steps in a process, make sure that there is also text (either on the same page, or in a linked page) that describes the same sequence of steps in words.

Animations can't usually be paused/stopped by users. This can, depending on the type of animation, its size, and whether it loops/repeats or not, be a minor distraction, or a major problem for certain user groups - particularly, if the animation contains fast strobing color changes. In general, we recommend avoiding the use of large, infinitely repeating animations, unless you are certain that they won't have an adverse impact on users. Consider providing a control to allow users to pause an animation. Consider taking advantage of the [`prefers-reduced-motion`](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion) [media query](#media-queries), and only having an animation take effect if the user has <em>not</em> indicated a preference for reduced motion/animations.

```html
<amp-animation ... media="not (prefers-reduced-motion: reduce)">
  <!-- this animation will only play if the user has *not*
       expressed a preference for reduced motion -->
  ...
</amp-animation>
```

You can take this further and provide separate, more subtle fallback animations to take effect when `prefers-reduced-motion: reduce` does evaluate to true, or split out smaller animations that should happen in all cases, regardless of the media feature.

```html
<amp-animation ... media="(prefers-reduced-motion: reduce)">
  <!-- fallback subtle animation effects that only play if the user
       has expressed a preference for reduced motion -->
  ...
</amp-animation>

<amp-animation ...>
  <!-- general/common animation effects that will take effect
       regardless of any user preference for reduced motion -->
  ...
</amp-animation>
```

See [MDN - `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) and this introductory article on [web.dev - prefers-reduced-motion: Sometimes less movement is more](https://web.dev/prefers-reduced-motion/) for further details.

For animations that are not purely decorative/visual effects, but actually convey information, make sure that any important text and graphical/non-text elements have sufficient color contrast. See [web.dev color and contrast accessibility](https://web.dev/color-and-contrast-accessibility/) for an introduction (primarily around text contrast) and [Knowbility: Exploring WCAG 2.1 — 1.4.11 Non‑text Contrast](https://knowbility.org/blog/2018/WCAG21-1411Contrast/) for more details around non-text elements.

## Attributes

### `trigger`

Determines when the animation should be triggered. This must be set to
`visibility` so the animation starts when a story page becomes visible and
active.

### `layout`

Should always be `nodisplay`.

### `id` (optional)

The `id` of the animation component. Used to reference the animation and chain a
sequence of animations.

## Actions <a name="actions"></a>

### `start`

Starts the animation if it's not running already. Timing properties and
variables. Can specify as action arguments. E.g. `anim1.start(delay=-100, --scale=2)`.

### `restart`

Starts the animation or restarts the currently running one. Timing properties
and variables. Can specify as action arguments. E.g. `anim1.start(delay=-100, --scale=2)`.

### `pause`

Pauses the currently running animation.

### `resume`

Resumes the currently running animation.

### `togglePause`

Toggles pause/resume actions.

### `seekTo`

Pauses the animation and seeks to the point of time specified by the `time`
argument in milliseconds or `percent` argument as a percentage point in the
timeline.

### `reverse`

Reverses the animation.

### `finish`

Finishes the animation.

### `cancel`

Cancels the animation.

## amp-story usage

If you want to use `<amp-animation>` with `<amp-story>`, please note that you should use `<amp-story-animation>` instead. More information on how to use it at the [Advanced animations](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/amp-story.md#Advanced-animations) section of the documentation.

## Validation

See [`amp-animation` rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-animation/validator-amp-animation.protoascii)
in the AMP validator specification.
