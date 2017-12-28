<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# Video analytics


## Support

AMP video analytics gathers data about how users interact with videos in AMP documents. Only AMP video extensions which implement AMP's common video interface are supported. These are listed below:

| Extension | Support level |
|--|--|
| `<amp-video>` | Full support |
| `<amp-3q-player>` | Partial support<sup>[1]</sup> |
| `<amp-brid-player>` | Partial support<sup>[1]</sup> |
| `<amp-dailymotion>` | Partial support<sup>[1]</sup> |
| `<amp-ima-video>` | Partial support<sup>[1]</sup> |
| `<amp-nexxtv-player>` | Partial support<sup>[1]</sup> |
| `<amp-ooyala-player>` | Partial support<sup>[1]</sup> |
| `<amp-youtube>` | Partial support<sup>[1]</sup> |
<sup>[1]</sup> Partial support means that all [video analytics common variables](#common-variables) are included, except for `currentTime`, `duration`, `playedRangesJson`, and `playedTotal`.


## Video analytics triggers

Supported AMP video extensions issue various analytics events during their lifecycle. These events can be reported through the analytics configuration using `video-*` triggers.

See [the AMP Analytics component](../amp-analytics/amp-analytics.md) for details on *amp-analytics* configuration.


### Video play trigger (`"on": "video-play"`)

The `video-play` trigger is fired when the video begins playing from a user clicking play or from autoplay beginning or resuming. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "myVideoPlay": {
    "on": "video-play",
    "request": "event",
    "selector": "#myVideo"
  },
  "videoSpec": {/* optional videoSpec */}
}
```

### Video pause trigger (`"on": "video-pause"`)

The `video-pause` trigger is fired when the video stops playing from a user clicking pause, from autoplay pausing, or from the video reaching the end. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "myVideoPause": {
    "on": "video-pause",
    "request": "event",
    "selector": "#myVideo"
  },
  "videoSpec": {/* optional videoSpec */}
}
```

### Video ended trigger (`"on": "video-ended"`)

The `video-ended` trigger is fired when the video has reached the end of playback. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "myVideoEnded": {
    "on": "video-ended",
    "request": "event",
    "selector": "#myVideo"
  },
  "videoSpec": {/* optional videoSpec */}
}
```

### Video session trigger (`"on": "video-session"`)

The `video-session` trigger is fired when a "video session" has ended. A video session starts when a video is played and ends when the video pauses, ends, or becomes invisible (optionally configurable). This trigger is configurable via the `videoSpec`. Configuration options include:

1. `end-session-when-invisible`

  Ends the session when the video becomes invisible after scrolling out of the viewport.

2. `exclude-autoplay`

  Excludes autoplaying videos from reporting.

```javascript
"triggers": {
  "myVideoSession": {
    "on": "video-session",
    "request": "event",
    "selector": "#myVideo"
  },
  "videoSpec": {/* optional videoSpec */}
}
```

### Video seconds played trigger (`"on": "video-seconds-played"`)

The `video-seconds-played` trigger is fired every `interval` seconds when the video is playing. The `video-seconds-played` trigger *requires* `interval` to be set in the `videoSpec`. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "myVideoSecondsPlayed": {
    "on": "video-seconds-played",
    "request": "event",
    "selector": "#myVideo"
  },
  "videoSpec": {
    "interval": 10, /* required */
    /* other optional videoSpec properties */
  }
}
```


## Video spec

You can use the `videoSpec` configuration object to control how the requests are fired.

### `end-session-when-invisible`

This spec property controls the `video-session` trigger. If `true`, the trigger will fire when the video is no longer visible, even if it is still playing. The default value is `false`.

### `exclude-autoplay`

This spec property controls all `video-*` triggers. If `true`, the trigger will not fire for videos that are autoplaying when the triggering event occurs. If a user interacts with the video and causes autoplay to stop, `video-*` triggers configured with `"exclude-autoplay": true` will begin to fire for that video. The default value is `false`.

### `interval`

This spec property controls the `video-seconds-played` trigger, and it is *required* for `video-seconds-played`.The value for `interval` specifies the number of seconds between each `video-seconds-played` event, and it must be greater than `0`. For example, a value of `10` fires the trigger every 10 seconds when the video is playing.


## Common variables

All video analytics triggers expose the following variables. These variables are also available in variable substitution with the [`VIDEO_STATE`](#VIDEO_STATE) variable.

| Var | Type | Description |
|--|--|--|
| `autoplay` | Boolean | Indicates whether the video began as an autoplay video. |
| `currentTime` | Number | Specifies the current playback time (in seconds) at the time of trigger. |
| `duration` | Number | Specifies the total duration of the video (in seconds). |
| `height` | Number | Specifies the height of video (in px). |
| `id` | String | Specifies the ID of the video element. |
| `playedTotal` | Number | Specifies the total amount of time the user has watched the video. |
| `state` | String | Indicates the state, which can be one “playing_auto”, “playing_manual”, or “paused”. |
| `width` | Number | Specifies the width of video (in px). |
| `playedRangesJson` | String | Represents segments of time the user has watched the video (in JSON format). For example, `[[1, 10], [5, 20]]` |
| `playedTotal` | Number | Specifies the total playing time for the session (in seconds). |


## Video analytics variables

Video analytics contributes the following variables to [AMP URL Variable Substitutions](../../spec/amp-var-substitutions.md).

### VIDEO_STATE

The `VIDEO_STATE(selector,property)` variable is substituted with the value of the selected video's specified property, as defined under [Common variables](#common-variables) above. The `selector` argument can be any valid CSS selector. The `property` argument can be the name of any of the common video analytics variables.
