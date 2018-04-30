# Video in AMP

Most video player components in AMP implement the VideoInterface. This means
that a set of features is available in all of this components, either completely
or partially.

This document describes all the features (**work in progress, incomplete**) that
these players implement.

These players include:

- amp-3q-player
- amp-brid-player
- amp-dailymotion
- amp-gfycat
- amp-ima-video
- amp-nexxtv-player
- amp-ooyala-player
- amp-video
- amp-wistia-player
- amp-youtube

## Autoplay

attribute: **`autoplay`**

If this attribute is present, and the browser supports autoplay:

- the video is automatically muted before autoplay starts
- when the video is scrolled out of view, the video is paused
- when the video is scrolled into view, the video resumes playback
- when the user taps the video, the video is unmuted
- if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.

See [here for an example](https://ampbyexample.com/components/amp-video/#autoplay).

## Analytics

See [video analytics](../extensions/amp-analytics/amp-video-analytics.md).

## Docking (minimize to corner)

attribute: **`dock`**

**Experimental feature. Setting this attribute is not currently valid.**

If this attribute is present and the video is playing manually, the video will
be "minimized" and fixed to a corner when the user scrolls out of the video
component's visual area.

- The video can be dragged and repositioned by the user on a different corner.
- Multiple videos on the same page can be docked.
- Users can dismiss the docked video by flicking it out of view. Once dismissed
by the user, docking will no longer occur.

### Styling

The docked video can be styled by selecting class names that are defined by the
AMP runtime.

#### `.amp-docked-video-shadow`

References a layer that draws a `box-shadow` under the video. The shadow can be
overridden or removed. Its opacity will change from 0 to 1 while the video is
being docked.

#### `.amp-docked-video-nudged`

References a layer that draws an overlay background over the video. The
background color can be overridden or removed.

#### `.amp-docked-video-controls`

References a layer that contains the docked video controls. Usually, this
doesn't need to be styled. See `.amp-docked-video-controls-bg` for a background
layer.

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

