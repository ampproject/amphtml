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

# <a name="amp-fx-collection"></a> `amp-fx-collection`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides a collection of preset visual effects, such as parallax.</td>
  </tr>
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

Currently, the `parallax` and `fade-in` effects are supported.
More effects such as `slide-in` are planned to be supported soon.

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

### fade-in (experimental)

The `fade-in` effect allows an element to fade in once the element being targetted is visible in the viewport.

##### data-duration

This is the duration over which the animation takes places. The default value is `1000ms`.

##### data-easing

This parameter lets you vary the animation's speed over the course of its duration. The default is `ease-in` which is `cubic-bezier(0.40, 0.00, 0.40, 1.00)`. You can choose from one of the presets available:
* “linear” - cubic-bezier(0.00, 0.00, 1.00, 1.00)
* “ease-in-out” - cubic-bezier(0.80, 0.00, 0.20, 1.00)
* “ease-in” - cubic-bezier(0.80, 0.00, 0.60, 1.00) (default)
* “ease-out” - cubic-bezier(0.40, 0.00, 0.40, 1.00)
or specify a `custom-bezier()` input

##### data-margin

This parameter determines when to trigger the timed animation. The value specified in `<percent>` dictates that the animation should be triggered when the specified amount of the element being targetted is visible. The default value is `5%`

#### Example: Main image fade in

In this case the image in fades in over a duration of 1500ms.

```html
  <div amp-fx="fade-in" data-easing="cubic-bezier(0.40, 0.00, 0.40, 1.00)">
    <amp-img width="1600" height="900" layout="responsive" src="https://picsum.photos/1600/900?image=1069"></amp-img>
  </div>
```

### fade-in-scroll (experimental)

The `fade-in-scroll` effect allows you to change the opacity of an element as it scrolls within the viewport. This creates a scroll dependent fade animation.

##### data-margin (optional)

This parameter determines when to start the animation. The value specified in `<percent>` dictates that the animation should be triggered when the specified amount of the element being targetted is visible. The default value is `X%`

##### data-margin-end (optional)

This parameter determines when to stop the animation. The value specified in `<percent>` dictates that the animation should have finished when the specified amount of the element being targetted is visible. The default value is `X%`

#### Example: Main image fade in

In this case the image in fades in over a duration of 1500ms.

```html
  <div amp-fx="fade-in" data-easing="cubic-bezier(0.40, 0.00, 0.40, 1.00)">
    <amp-img width="1600" height="900" layout="responsive" src="https://picsum.photos/1600/900?image=1069"></amp-img>
  </div>
```

## Validation

See [amp-fx-collection rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-fx-collection/validator-amp-fx-collection.protoascii) in the AMP validator specification.
