# Video in AMP

Most video player components in AMP implement the [`VideoInterface`](https://github.com/ampproject/amphtml/blob/main/src/video-interface.js) API. This means
that a set of features is available in all of these components, either completely
or partially.

This document describes all the features (**work in progress, incomplete**) that
these players implement.

## Players

### Generic

-   [amp-video](https://amp.dev/documentation/components/amp-video)
-   [amp-video-iframe](https://amp.dev/documentation/components/amp-video-iframe)

### For 3rd party services

<!--
  The following list is generated automatically:

    amp check-video-interface-list --fix

  Link check disabled to allow new extensions added in a pull request.
-->

<!-- markdown-link-check-disable -->

-   [amp-3q-player](https://amp.dev/documentation/components/amp-3q-player)
-   [amp-brid-player](https://amp.dev/documentation/components/amp-brid-player)
-   [amp-brightcove](https://amp.dev/documentation/components/amp-brightcove)
-   [amp-dailymotion](https://amp.dev/documentation/components/amp-dailymotion)
-   [amp-delight-player](https://amp.dev/documentation/components/amp-delight-player)
-   [amp-gfycat](https://amp.dev/documentation/components/amp-gfycat)
-   [amp-ima-video](https://amp.dev/documentation/components/amp-ima-video)
-   [amp-jwplayer](https://amp.dev/documentation/components/amp-jwplayer)
-   [amp-minute-media-player](https://amp.dev/documentation/components/amp-minute-media-player)
-   [amp-mowplayer](https://amp.dev/documentation/components/amp-mowplayer)
-   [amp-nexxtv-player](https://amp.dev/documentation/components/amp-nexxtv-player)
-   [amp-ooyala-player](https://amp.dev/documentation/components/amp-ooyala-player)
-   [amp-powr-player](https://amp.dev/documentation/components/amp-powr-player)
-   [amp-vimeo](https://amp.dev/documentation/components/amp-vimeo)
-   [amp-viqeo-player](https://amp.dev/documentation/components/amp-viqeo-player)
-   [amp-wistia-player](https://amp.dev/documentation/components/amp-wistia-player)
-   [amp-youtube](https://amp.dev/documentation/components/amp-youtube)

<!-- markdown-link-check-enable -->

<a id="analytics"></a>

## Analytics

See [video analytics](https://github.com/ampproject/amphtml/blob/main/extensions/amp-analytics/amp-video-analytics.md).

<a id="autoplay"></a>

## Autoplay

attribute: **`autoplay`**

If this attribute is present, and the browser supports autoplay:

-   the video is automatically muted before autoplay starts
-   when the video is scrolled out of view, the video is paused
-   when the video is scrolled into view, the video resumes playback
-   when the user taps the video, the video is unmuted
-   if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.

For an example, visit [AMP By Example](https://amp.dev/documentation/examples/components/amp-video/#autoplay).

<a id="docking"></a>

## Docking (minimize to corner)

attribute: **`dock`**

This attribute is currently only supported for `amp-brightcove`, `amp-dailymotion`, `amp-delight-player`, `amp-ima-video`, `amp-jwplayer`, `amp-video`, `amp-video-iframe` and `amp-youtube`.

If this attribute is present and the video is playing manually, the video will
be "minimized" and fixed to a corner when the user scrolls out of the video
component's visual area.

-   The video can be dragged and repositioned by the user on a different corner.
-   Multiple videos on the same page can be docked.

In order to use this attribute, the [`amp-video-docking`](https://amp.dev/documentation/components/amp-video-docking)
extension script must be present:

```html
<script
  async
  custom-element="amp-video-docking"
  src="https://cdn.ampproject.org/v0/amp-video-docking-0.1.js"
></script>
```

For more details, see [documentation on the docking extension itself.](https://amp.dev/documentation/components/amp-video-docking)

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
