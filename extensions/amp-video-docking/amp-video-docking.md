---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Functionality for videos that dock to a corner.
---
<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

Functionality for videos that dock to a corner.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-video-docking" src="https://cdn.ampproject.org/v0/amp-video-docking-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>AMP By Example's:<ul>
      <li><a href="https://ampbyexample.com/advanced/advanced_video_docking/">advanced video docking</a></li>
    </ul></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>N/A</td>
  </tr>
</table>

## Behavior

The `amp-video-docking` extension allows videos to be minimized to a corner or
to a custom positioned element via the `dock` attribute.

If this attribute is present and the video is playing manually, the video will
be "docked" and fixed to a corner when the user scrolls out of the video
component's visual area.

- The video can be dragged and repositioned by the user on a different corner.
- Multiple videos on the same page can be docked.

This extension is used in conjunction with a [supported video player](../../spec/amp-video-interface.md).
Currently, the supported players are:

- [`amp-brightcove`](https://www.ampproject.org/docs/reference/components/amp-brightcove)
- [`amp-ima-video`](https://www.ampproject.org/docs/reference/components/amp-ima-video)
- [`amp-video`](https://www.ampproject.org/docs/reference/components/amp-video)
- [`amp-video-iframe`](https://www.ampproject.org/docs/reference/components/amp-youtube)
- [`amp-youtube`](https://www.ampproject.org/docs/reference/components/amp-youtube)

### Styling

The docked video can be styled by selecting elements that are created by the
AMP runtime.

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

