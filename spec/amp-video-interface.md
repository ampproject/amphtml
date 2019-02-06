# Video in AMP

Most video player components in AMP implement the [`VideoInterface`](https://github.com/ampproject/amphtml/blob/master/src/video-interface.js) API. This means
that a set of features is available in all of these components, either completely
or partially.

This document describes all the features (**work in progress, incomplete**) that
these players implement.

These players include:

- [amp-3q-player](https://www.ampproject.org/docs/reference/components/amp-3q-player)
- [amp-brid-player](https://www.ampproject.org/docs/reference/components/amp-brid-player)
- [amp-dailymotion](https://www.ampproject.org/docs/reference/components/amp-dailymotion)
- [amp-gfycat](https://www.ampproject.org/docs/reference/components/amp-gfycat)
- [amp-ima-video](https://www.ampproject.org/docs/reference/components/amp-ima-video)
- [amp-nexxtv-player](https://www.ampproject.org/docs/reference/components/amp-nexxtv-player)
- [amp-ooyala-player](https://www.ampproject.org/docs/reference/components/amp-ooyala-player)
- [amp-video](https://www.ampproject.org/docs/reference/components/amp-video)
- [amp-wistia-player](https://www.ampproject.org/docs/reference/components/amp-wistia-player)
- [amp-youtube](https://www.ampproject.org/docs/reference/components/amp-youtube)

<a id="analytics"></a>

## Analytics

See [video analytics](https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/amp-video-analytics.md).

<a id="autoplay"></a>

## Autoplay

attribute: **`autoplay`**

If this attribute is present, and the browser supports autoplay:

- the video is automatically muted before autoplay starts
- when the video is scrolled out of view, the video is paused
- when the video is scrolled into view, the video resumes playback
- when the user taps the video, the video is unmuted
- if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.

For an example, visit [AMP By Example](https://ampbyexample.com/components/amp-video/#autoplay).

<a id="docking"></a>

## Docking (minimize to corner)

attribute: **`dock`**

**Experimental feature.**

If this attribute is present and the video is playing manually, the video will
be "minimized" and fixed to a corner when the user scrolls out of the video
component's visual area.

- The video can be dragged and repositioned by the user on a different corner.
- Multiple videos on the same page can be docked.
- Users can dismiss the docked video by flicking it out of view. Once dismissed
by the user, docking will no longer occur.

In order to use this attribute, the [`amp-video-docking`](https://github.com/ampproject/amphtml/blob/master/extensions/amp-video-docking/amp-video-docking.md)
extension script must be present:

```
<script async custom-element="amp-video-docking" src="https://cdn.ampproject.org/v0/amp-video-docking-0.1.js"></script>
```

### Styling

The docked video can be styled by selecting class names that are defined by the
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

<a id="rotate-to-fullscreen"></a>

## Rotate-to-fullscreen

attribute: **`rotate-to-fullscreen`**

This attribute is currently only supported for `amp-video`, `amp-ima-video` and `amp-dailymotion`.

If this attribute is present and a video is playing manually (i.e. user initiated playback, or tapped on the video after autoplay), the video displays fullscreen after the user rotates their device into landscape mode, provided that the video is visible.

When multiple videos with the `rotate-to-fullscreen` attribute set are visible
at the same time, heuristics are employed to select which video to display in
fullscreen. These heuristics are applied as follows, in descending priority:

1. If a video is playing manually (i.e. user initiated playback, or tapped on the video after autoplay)
2. If the visible percentage of the video is higher.
3. If a video is closer to the center of the viewport.
4. Everything else failing, select the video that is closest to the top of the
viewport.
