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

# <a name="amp-video-analytics"></a>AMP and video analytics


## Video analytics triggers

AMP video extensions issue various analytics events during their lifecycle. These events can be reported through the analytics configuration using `video-*` triggers.

See [amp-analytics.md](../amp-analytics/amp-analytics.md) for details on *amp-analytics* configuration.


### Video played trigger (`"on": "video-played"`)

The `video-played` trigger is fired when the video begins playing from a user clicking play or from autoplay beginning or resuming. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "myVideoPlayed": {
    "on": "video-played",
    "request": "event"
  },
  "videoSpec": {/* optional videoSpec */}
}
```

### Video paused trigger (`"on": "video-paused"`)

The `video-paused` trigger is fired when the video stops playing from a user clicking pause, from autoplay pausing, or from the video reaching the end. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "myVideoPaused": {
    "on": "video-paused",
    "request": "event"
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
    "request": "event"
  },
  "videoSpec": {/* optional videoSpec */}
}
```

### Video session trigger (`"on": "video-session"`)

The `video-session` trigger is fired when a "video session" has ended. A video session starts when a video is played and ends when video pauses, ends, or goes out of the viewport. This trigger is configurable in the `videoSpec` by setting `end-session-when-invisible`. Autoplaying videos can be optionally removed from this reporting by setting `exclude-autoplay` in the `videoSpec`. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "myVideoSession": {
    "on": "video-session",
    "request": "event"
  },
  "videoSpec": {/* optional videoSpec */}
}
```

### Video seconds played trigger (`"on": "video-seconds-played"`)

The `video-seconds-played` trigger is fired when a specified number of seconds have passed since the last time the event fired. This *requires* `interval` to be set in the `videoSpec`. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "myVideoSecondsPlayed": {
    "on": "video-seconds-played",
    "request": "event"
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

This spec property controls the `video-session` trigger. If true, the trigger will fire when the video is no longer visible, even if it is still playing. The default value is `false`.

### `exclude-autoplay`

This spec property controls all `video-*` triggers. If true, the trigger will not fire for videos that are currently autoplaying, not just initially autoplaying. If a user interacts with the video and changes its state from autoplaying, the trigger will include events issued by the video. The default value is `false`.

### `interval`

This spec property controls the `video-seconds-played` trigger, and it is *required* for this trigger. Its value is the number of seconds between each `video-seconds-played` event. It must be greater than `0`. For example, a value of `10` would fire the trigger every 10 seconds.


## Common variables

All video analytics triggers expose the following variables. These variables are also available in variable substitution with the [`VIDEO_STATE`](#VIDEO_STATE) variable.

| Var | Type | Description |
|--|--|--|
| ${autoplay} | Boolean | Indicates whether the video began as an autoplay video. |
| ${currentTime} | Number | Specifies the current playback time (in seconds) at the time of trigger. |
| ${duration} | Number | Specifies the total duration of the video (in seconds). |
| ${height} | Number | Specifies the height of video (in px). |
| ${id} | String | Specifies the ID of the video element. |
| ${playedTotal} | Number | Specifies the total amount of time the user has watched the video. |
| ${state} | String | Indicates the state, which can be one “playing_auto”, “playing_manual”, or “paused”. |
| ${width} | Number | Specifies the width of video (in px). |
| ${playedRangesJson} | String | Representssegments of time the user has watch the video (in JSON format). For example, [[1, 10], [5, 20]] |
| ${playedTotal} | Number | Specifies the total playing time for the session (in seconds). |


## Video analytics variables

Video analytics contributes the following URL substitutions to [amp-var-substitutions.md](../../spec/amp-var-substitutions.md).

### VIDEO_STATE

The `VIDEO_STATE(selector,property)` variable is substituted with the value of the selected video's specified property. The `selector` argument can be any valid CSS selector. Any of the [common video analytics variables](#common-variables) are valid values for the `property` argument.
