---
$category@: layout
formats:
  - websites
teaser:
  text: Provides a collection of preset visual effects, such as parallax.
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

# amp-fx-collection
Provides a collection of preset visual effects, such as parallax.

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-fx-collection" src="https://cdn.ampproject.org/v0/amp-fx-collection-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-fx-collection/">amp-fx-collection</a> example.</td>
  </tr>
</table>

## Overview

The `amp-fx-collection` extension provides a collection of preset visual effects,
such as parallax that can be easily enabled on any element via attributes.

To specify a visual effect for an element, add the `amp-fx` attribute with the value of the visual effect.


## Visual effects

Below are the supported visual effects for the amp-fx-collection:

### parallax

The `parallax` effect allows an element to move as if it is nearer or farther relative
to the foreground of the page content. As the user scrolls the page, the element
scrolls faster or slower depending on the value assigned to the
`data-parallax-factor` attribute.

##### data-parallax-factor

Specifies a decimal value that controls how much faster or slower the element scrolls
relative to the scrolling speed:

- A value greater than 1 scrolls the element upward (element scrolls faster) when the user scrolls down the page.
- A value less than 1 scrolls the element downward (element scrolls slower) when the user scrolls downward.
- A value of 1 behaves normally.
- A value of 0 effectively makes the element scroll fixed with the page.

#### Example: Title parallax

In this example, as the user scrolls the page, the h1 element scrolls faster relative to the page's content.

```html
<h1 amp-fx="parallax" data-parallax-factor="1.5">
  A title that moves faster than other content.
</h1>
```

### fade-in

The `fade-in` effect allows an element to fade in once the element being targetted is visible in the viewport.

##### data-duration (optional)

This is the duration over which the animation takes places. The default value is `1000ms`.

In the below example, the animation lasts over `2000ms`.

```html
  <div amp-fx="fade-in" data-duration="2000ms">
    <amp-img width="1600" height="900" layout="responsive" src="https://picsum.photos/1600/900?image=1069"></amp-img>
  </div>
```

##### data-easing (optional)

This parameter lets you vary the animation's speed over the course of its duration. The default is `ease-in` which is `cubic-bezier(0.40, 0.00, 0.40, 1.00)`. You can choose from one of the presets available:
* “linear” - cubic-bezier(0.00, 0.00, 1.00, 1.00)
* “ease-in-out” - cubic-bezier(0.80, 0.00, 0.20, 1.00)
* “ease-in” - cubic-bezier(0.80, 0.00, 0.60, 1.00) (default)
* “ease-out” - cubic-bezier(0.40, 0.00, 0.40, 1.00)
or specify a `custom-bezier()` input

In the below example, the animation acceleration curve is a custom specified `cubic-bezier(...)` curve.

```html
  <div amp-fx="fade-in" data-easing="cubic-bezier(0.40, 0.00, 0.40, 1.00)">
    <amp-img width="1600" height="900" layout="responsive" src="https://picsum.photos/1600/900?image=1069"></amp-img>
  </div>
```

##### data-margin-start (optional)

This parameter determines when to trigger the timed animation. The value specified in `<percent>` dictates that the animation should be triggered when the element has crossed that percentage of the viewport. The default value is `5%`.

In the below example, the animation doesn't start until the element has crossed 20% of the viewport from the bottom.

```html
  <div amp-fx="fade-in" data-margin-start="20%">
    <amp-img width="1600" height="900" layout="responsive" src="https://picsum.photos/1600/900?image=1069"></amp-img>
  </div>
```

### fade-in-scroll

The `fade-in-scroll` effect allows you to change the opacity of an element as it scrolls within the viewport. This creates a scroll dependent fade animation. By default once the element is fully visible we don't animate the opacity anymore.

##### data-margin-start (optional)

This parameter determines when to trigger the timed animation. The value specified in `<percent>` dictates that the animation should be triggered when the element has crossed that percentage of the viewport. The default value is `0%`

##### data-margin-end (optional)

This parameter determines when to stop the animation. The value specified in `<percent>` dictates that the animation should have finished when the specified amount of the element being targetted is visible. The default value is `50%`

In the below example, the `<div>` is fully visible by the time it has crossed 80% of the viewport from the bottom.

```html
  <div amp-fx="fade-in-scroll" data-margin-end="80%">
    <amp-img width="1600" height="900" layout="responsive" src="https://picsum.photos/1600/900?image=1069"></amp-img>
  </div>
```

##### data-repeat (optional)

By default once the element is fully visible we don't animate the opacity anymore. If you want the opacity to change with the scroll, even when the element has fully loaded, specify this variable on the animation.

In the below example, the animation is fully dependent on scroll and the `<div>` fades in and out as the user scrolls.

```html
  <div amp-fx="fade-in-scroll" data-repeat>
    <amp-img width="1600" height="900" layout="responsive" src="https://picsum.photos/1600/900?image=1069"></amp-img>
  </div>
```

### float-in-top, float-in-bottom

The `float-in` effects slide a [`position: fixed`](https://developer.mozilla.org/en-US/docs/Web/CSS/position) element in-and-out of view as the document is scrolled up or down.

An element with `amp-fx="float-in-top"` or `...bottom` must have the following CSS properties:

- `position: fixed`
- `overflow: hidden`
- **if it's `top`**, `top: 0`
- **if it's `bottom`**, `bottom: 0`

If any of these is not set, the effect will not be applied and a warning will be
thrown in [development mode.](https://www.ampproject.org/docs/fundamentals/validate#browser-developer-console)

### fly-in-bottom, fly-in-left, fly-in-right, fly-in-top

The `fly-in` effects allow an element's position to be translated by a specified amount once it is in the viewport.

##### data-duration (optional)

This is the duration over which the animation takes places. The default value differs across devices as follows:
Between `480 px` (the minimum width of a mobile device) and `1000px` (the minimum width of a laptop screen width), we scale the default duration between `400ms` and `600ms`.

Here are some examples to help you better understand this:
1. screen width - `610px` the default duration for a `fly-in-bottom` would be `450ms`.
2. screen width - `675px` the default duration for a `fly-in-bottom` would be `475ms`.
3. screen width - `740px` the default duration for a `fly-in-bottom` would be `500ms`.
4. screen width - `805px` the default duration for a `fly-in-bottom` would be `525ms`.
5. screen width - `870px` the default duration for a `fly-in-bottom` would be `550ms`.

If the user overrides this default value of `data-duration` to `Xms`, the same default will apply across all devices.

##### data-easing (optional)

This parameter lets you vary the animation's speed over the course of its duration. The default is `ease-out` which is `cubic-bezier(0.40, 0.00, 0.40, 1.00)`. You can choose from one of the presets available:
* “linear” - cubic-bezier(0.00, 0.00, 1.00, 1.00)
* “ease-in-out” - cubic-bezier(0.80, 0.00, 0.20, 1.00)
* “ease-in” - cubic-bezier(0.80, 0.00, 0.60, 1.00)
* “ease-out” - cubic-bezier(0.40, 0.00, 0.40, 1.00) (default)
or specify a `custom-bezier()` input.

##### data-fly-in-distance (optional)

This parameter determines the translation to take place. The value is specified in `<percent>` of viewport. The default value are as follows:
<table>
  <tr>
    <th>amp-fx value</th>
    <th>Mobile</th>
    <th>Tablet</th>
    <th>Desktop</th>
  </tr>
  <tr>
    <td>fly-in-bottom</td>
    <td>`25%`</td>
    <td>`25%`</td>
    <td>`33%`</td>
  </tr>
  <tr>
    <td>fly-in-top</td>
    <td>`25%`</td>
    <td>`25%`</td>
    <td>`33%`</td>
  </tr>
  <tr>
    <td>fly-in-left</td>
    <td>`100%`</td>
    <td>`100%`</td>
    <td>`100%`</td>
  </tr>
  <tr>
    <td>fly-in-right</td>
    <td>`100%`</td>
    <td>`100%`</td>
    <td>`100%`</td>
  </tr>
</table>

In the below example, the element is translated along the Y axis across `20%` of the viewport.

```html
  <div amp-fx="fly-in-bottom" data-fly-in-distance="20%">
    <amp-img width="1600" height="900" layout="responsive" src="https://picsum.photos/1600/900?image=1069"></amp-img>
  </div>
```

##### data-margin-start (optional)

This parameter determines when to trigger the timed animation. The value specified in `<percent>` dictates that the animation should be triggered when the element has crossed that percentage of the viewport. The default value is `5%`.

## Combining presets

Developers can also combine `amp-fx` presets together to create combined animations.


In the below example, the element is both translated along the Y axis and has it's opacity changed from `0` to `1` over a duration of `1000ms`.

```html
  <div amp-fx="fade-in fly-in-bottom" data-duration="1000ms">
    <amp-img width="1600" height="900" layout="responsive" src="https://picsum.photos/1600/900?image=1069"></amp-img>
  </div>
```

However, there are some presets which don't combine together to create great results. In such cases, we accept the first preset listed and ignore the clashing preset and warn in the console.

In the below example, the element is being translated along the Y axis by two clashing presets `parallax` and `fly-in-bottom`. In this case we only allow the `parallax` animation and ignore the `fly-in-bottom` preset.

```html
  <div amp-fx="parallax fly-in-bottom" data-parallax-factor="1.5">
    <amp-img width="1600" height="900" layout="responsive" src="https://picsum.photos/1600/900?image=1069"></amp-img>
  </div>
```

Below is a list of group of presets, AMP advises you don't combine:
1. `parallax`, `fly-in-top`, `fly-in-bottom`,
2. `fly-in-left`, `fly-in-right`,
3. `fade-in`, `fade-in-scroll`.

## Validation

See [amp-fx-collection rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-fx-collection/validator-amp-fx-collection.protoascii) in the AMP validator specification.
