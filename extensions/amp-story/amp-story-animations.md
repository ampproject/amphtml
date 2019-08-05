<!---
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

## Animations

Every element inside an `<amp-story-page>` can have an entrance animation.

You can configure animations by specifying a set of [animation attributes](#animation-attributes) on the element; no additional AMP extensions or configuration is needed.

### Animation effects

The following animation effects are available as presets for AMP stories:


| Preset name       | Default duration (ms) | Default delay (ms) |
| ----------------- | --------------------- | ------------------ |
| `drop`            | 1600                  | 0 |
| `fade-in`         | 500                   | 0 |
| `fly-in-bottom`   | 500                   | 0 |
| `fly-in-left`     | 500                   | 0 |
| `fly-in-right`    | 500                   | 0 |
| `fly-in-top`      | 500                   | 0 |
| `pulse`           | 500                   | 0 |
| `rotate-in-left`  | 700                   | 0 |
| `rotate-in-right` | 700                   | 0 |
| `twirl-in`        | 1000                  | 0 |
| `whoosh-in-left`  | 500                   | 0 |
| `whoosh-in-right` | 500                   | 0 |
| `pan-left`        | 1000                  | 0 |
| `pan-right`       | 1000                  | 0 |
| `pan-down`        | 1000                  | 0 |
| `pan-up`          | 1000                  | 0 |
| `zoom-in`         | 1000                  | 0 |
| `zoom-out`        | 1000                  | 0 |


{% call callout('Tip', type='success') %}
See a [live demo of all the AMP story animations](https://amp.dev/documentation/examples/visual-effects/amp_story_animations/) on AMP By Example.
{% endcall %}


### Animation attributes

#####  animate-in [required]

Use this attribute to specify the name of the entrance [animation preset](#animation-effects).

*Example*: A heading flies in from left of the page.

```html
<h2 animate-in="fly-in-left">
Fly from left!
</h2>
```

##### animate-in-duration [optional]

Use this attribute to specify the duration of the entrance animation, in seconds or milliseconds (e.g., 0.2s or 200ms). The default duration depends on the animation preset you specified.

*Example*: A heading flies in from left of the page and the animation finishes within half a second.

```html
<h2 animate-in="fly-in-left" animate-in-duration="0.5s" >
Fly from left!
</h2>
```

##### animate-in-timing-function [optional]

Use this attribute to specify the timing function (animation curve) of the entrance animation. The default timing function depends on the animation preset you specified.

*Example*: A heading flies in from left of the page and the animation decelerates (ease-out).

```html
<h2 animate-in="fly-in-left" animate-in-timing-function="cubic-bezier(0.0, 0.0, 0.2, 1)" >
Fly from left!
</h2>
```

##### animate-in-delay [optional]

Use this attribute to specify the delay before starting the animation. The value must be greater than or equal to 0, in seconds or milliseconds (for example, 0.2s or 200ms). The default delay depends on the animation preset you specified.

*Example*: After 0.4 seconds, a heading flies in from the left of the page and completes its entrance within 0.5 seconds.

```html
<h2 animate-in="fly-in-left"
    animate-in-duration="0.5s"
    animate-in-delay="0.4s">
Fly from left!
</h2>
```

{% call callout('Note', type='note') %}
The animation delay is not guaranteed to be exact. Additional delays can be caused by loading the `amp-animation` extension in the background when the first animated element has been scanned. The attribute contract is defined as *delay this animation for at least N milliseconds*. This applies to all elements including those with a delay of 0 seconds.
{% endcall %}

##### animate-in-after [optional]

Use this attribute to chain or sequence animations (for example, animation2 starts after animation1 is complete). Specify the ID of the animated element that this element's animation will follow. The element must be present on the same `<amp-story-page>`. The delay is applied after the previous element's animation has finished. For further details, see the [Sequencing animations](#sequencing-animations) section below.

For example, in the following code, `object2` animates in after `object1` completes their entrance:

```html
<amp-story-page id="page1">
  <amp-story-grid-layer template="vertical">
    <div id="object1"
        animate-in="rotate-in-left">
        1
    </div>
    <div id="object2"
        animate-in="fly-in-right"
        animate-in-after="object1">
        2 <!-- will start after object1 has finished -->
    </div>
  </amp-story-grid-layer>
</amp-story-page>
```

##### scale-start, scale-end [optional, only works with `zoom-in` & `zoom-out` animations]

Use these two attributes to further specify the parameters of your zoom-in and zoom-out animations. The value must be greater than or equal to 0, and decimals are allowed. The default will be scale-start: 1 and scale-start: 3 for zoom-in, and the inverse for zoom-out.

*Example*: An image zooming-in from 2x to 5x its size over 4 seconds.

```html
<amp-img animate-in="zoom-in" scale-start="2" scale-end="5" animate-in-duration="4s" layout="fixed" src="https://picsum.photos/720/320?image=1026" width="720" height="320">
</amp-img>
```

##### translate-x [optional, only works with `pan-left` & `pan-right` animations]

Use this attribute to specify the horizontal panning of your image in a pan-left/pan-right animation. The value must be greater than or equal to 0 in pixels. The default value will pan the whole width of the specified image.

*Example*: An image panning 200px to the left over 10 seconds.

```html
<amp-img animate-in="pan-left" translate-x="200px" animate-in-duration="10s" layout="fixed" src="https://picsum.photos/720/320?image=1026" width="720" height="320">
</amp-img>
```

##### translate-y [optional, only works with `pan-up` & `pan-down` animations]

Use this attribute to specify the vertical panning of your image in a pan-up/pan-down animation. The value must be greater than or equal to 0 in pixels. The default value will pan the whole height of the specified image.

*Example*: An image panning 50px down over 15 seconds.

```html
<amp-img animate-in="pan-down" translate-y="50px" animate-in-duration="15s" layout="fixed" src="https://picsum.photos/720/320?image=1026" width="720" height="320">
</amp-img>
```

### Sequencing animations

To chain animations in sequence, use the `animate-in-after` attribute. All elements in a given chain must be present in the same `<amp-story-page>`. Elements without the `animate-in-after` attribute do not belong to a sequence chain, and will start independently on page entrance.

```html
<amp-story-page id="my-sequencing-page">
  <amp-story-grid-layer template="vertical">
    <div class="circle"
        animate-in="drop-in"
        animate-in-duration="1.8s">
      1 <!-- will start independently -->
    </div>
    <div id="rotate-in-left-obj"
        class="square"
        animate-in="rotate-in-left"
        animate-in-after="fade-in-obj"
        animate-in-delay="0.2s">
      2 <!-- will start after fade-in-obj has finished -->
    </div>
    <div class="square"
        animate-in-after="rotate-in-left-obj"
        animate-in="whoosh-in-right"
        animate-in-delay="0.2s">
      3 <!-- will start after rotate-in-left-obj has finished -->
    </div>
    <div id="fade-in-obj"
        class="circle"
        animate-in="fade-in"
        animate-in-duration="2.2s">
      1 <!-- will start independently -->
    </div>
  </amp-story-grid-layer>
</amp-story-page>
```
### Combining multiple animations

You can apply multiple entrance animations on one element (for example, an element flies into the page and fades in at the same time). It's not possible to assign more than one animation preset to a single element; however, elements with different entrance animations can be nested to combine them into one.

```html
<div animate-in="fly-in-left">
   <div animate-in="fade-in">
     I will fly-in and fade-in!
   </div>
</div>
```

{% call callout('Note', type='note') %}
If a composed animation is supposed to start after the end of a separate element's animation, make sure that all nested elements that compose the animation have the attribute `animate-in-after` set to the same `id`.
{% endcall %}
