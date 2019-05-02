---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Functionality for videos that minimize ("dock") to a corner or a custom position on scroll.
---
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

# amp-video-docking

[TOC]

Functionality for videos that minimize ("dock") to a corner or a custom position on scroll.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-video-docking" src="https://cdn.ampproject.org/v0/amp-video-docking-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>AMP By Example's:<ul>
      <li><a href="https://ampbyexample.com/advanced/advanced_video_docking/">Advanced video docking</a> with multiple targets, event triggers and media queries.</li>
    </ul></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>N/A</td>
  </tr>
</table>

## Behavior

The `amp-video-docking` extension allows videos to be minimized to a corner or
to a custom positioned element via the `dock` attribute.

If this attribute is present and the video is playing manually, the video will
be "docked" and float on a corner or a custom position when the user scrolls out of the video
component's visual area. If the user scrolls back, the video reverts to its original static position.

- The video can be docked to a default corner or to a custom fixed position.
- The video can be dragged and repositioned by the user on a different corner.
- The video can be flicked to be dismissed from its docked position.
- Multiple videos on the same page can be docked, but only one at a time will be docked and fixed.

### <a id="support"></a> Support

This extension is used in conjunction with a [supported video player](../../spec/amp-video-interface.md).
Currently, the supported players are:

- [`amp-brightcove`](https://amp.dev/documentation/components/amp-brightcove)
- [`amp-dailymotion`](https://amp.dev/documentation/components/amp-dailymotion)
- [`amp-delight-player`](https://github.com/ampproject/amphtml/blob/master/extensions/amp-delight-player/amp-delight-player.md)
- [`amp-ima-video`](https://amp.dev/documentation/components/amp-ima-video)
- [`amp-video`](https://amp.dev/documentation/components/amp-video)
- [`amp-video-iframe`](https://amp.dev/documentation/components/amp-video-iframe)
- [`amp-youtube`](https://amp.dev/documentation/components/amp-youtube)

### Triggering conditions

Note that the video won't be docked unless it's playing *manually*. This means:

- If the video has `autoplay`, the feature will not be triggered unless the user clicks on the video first.
- If the video does not have `autoplay`, the feature will not be triggered unless the user plays the video.
- If the video is paused while scrolling, it will not be docked.

## Attributes

N/A. `amp-video-docking` does not define any custom elements. To use this extension, set the `dock` attribute on
an [elligible video player component.](#support)

## <a id="target"></a> Docking target

On scroll, the video will minimize to an automatically calculated corner or to a custom defined position.

### Corner

When setting the `dock` attribute with an empty value, the video will dock to a corner defined by the extension:

```html
<amp-video src="my-video.mp4" ... dock>
```

By default, the video will be minimized to the top-right corner. It will be sized at 30% of the viewport's width, no less than 180 pixels wide. If the document is [RTL](https://www.w3.org/International/questions/qa-html-dir), the video will dock to the top-left corner. When in this mode, users can drag the docked video to snap to either corner.

### Custom position by "slot"

When setting the `dock` attribute to a non-empty value, the video will dock to the same position as a "slot element" referenced in the attribute value by [CSS selector.](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)

```html
<amp-layout id="my-dock-slot" ...>
<amp-video src="my-video.mp4" ... dock="#my-dock-slot">
```
The slot element must always be an [`amp-layout`](https://amp.dev/documentation/components/amp-layout), which allows us to leverage the [AMP layout system](https://amp.dev/documentation/guides-and-tutorials/learn/amp-html-layout/) in order to keep the same sizing properties between the slot and the video.

In order for custom positioning to work properly, the slot element must be [`position: fixed`.](https://developer.mozilla.org/en-US/docs/Web/CSS/position)

### <a id="combined-targets"></a> Combining corner and custom position behavior

Custom positioning will be rejected when the element target is not visible. This means that corner targets or slot elements can be picked depending on layout by [CSS media queries.](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries) For an example where target types are combined and applied in different layout conditions, [see AMP by Example.](https://ampbyexample.com/advanced/advanced_video_docking/)

## Events

### `dock` and `undock`

When the video becomes docked or undocked by scrolling, the [low-trust events](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events) `dock` and `undock` are triggered respectively.

These can, for example, trigger an [`amp-animation`](https://amp.dev/documentation/components/amp-animation) that slides content in order to make room for the docked element. For an example where events trigger animations required for docking, [see AMP by Example.](https://ampbyexample.com/advanced/advanced_video_docking/)

### Event source

Depending on the [docking target](#target), the corresponding event will be triggered from different source elements:

- **From the video element itself**, when the video is docked to a corner.
- **From the slot element**, when the video is docked to the slot element.

You can set `dock`/`undock` action triggers on either the video or the slot to alter your layout differently when [combining target types.](#combined-targets)

## Styling

The docked video can be styled by selecting elements that are created by this extension.

#### `.amp-docked-video-shadow`

References a layer that draws a `box-shadow` under the video. The shadow can be
overridden or removed. Its opacity will change from 0 to 1 while the video is
being docked.

#### `.amp-docked-video-controls`

References a layer that contains the docked video controls. Usually, this
doesn't need to be styled. See `.amp-docked-video-controls-bg` for a background
layer.

This element also gets the classname `amp-small` applied when rendered in small areas (those under 300 pixels wide), and the classname `amp-large` when not.

#### `.amp-docked-video-controls-bg`

References a layer that draws an overlay background over the video and under
the controls. It's displayed only when the controls are displayed. Its
background can be overridden or removed.

#### `.amp-docked-video-button-group`

A button "group" that usually contains two buttons, with only one displayed at
a time. It's used to draw a background when the button is active. It has a
`border-radius` and a `background-color` set by default, both of which can be
removed or overrridden.

Direct children (`.amp-docked-video-button-group > [role=button]`) represent
buttons, which have an SVG background. The color of the SVG can be changed by
modifying the `fill` property. Additionally, these can be replaced by changing
the `background` property.

#### `.amp-docked-video-play`

Represents the `play` button.

#### `.amp-docked-video-pause`

Represents the `pause` button.

#### `.amp-docked-video-mute`

Represents the `mute` button.

#### `.amp-docked-video-unmute`

Represents the `unmute` button.

#### `.amp-docked-video-fullscreen`

Represents the `fullscreen` button.

#### `.amp-video-docked-placeholder-background`

Represents a container for placeholder elements placed on the empty component area.

#### `.amp-video-docked-placeholder-background-poster`

Represents a layer displaying the `poster` or `placeholder` image of the video on the empty component area. Blurred by default.

#### `.amp-video-docked-placeholder-icon`

Represents an animated icon for a UX affordance displayed on the empty component area.

This element also gets the classname `amp-small` when rendered in small viewports (those under 420 pixels wide). It also gets the classname `amp-rtl` when animating from right to left.
