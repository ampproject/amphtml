<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-dailymotion"></a> `amp-dailymotion`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td> Displays a <a href="http://www.dailymotion.com/">Dailymotion</a> video.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-dailymotion" src="https://cdn.ampproject.org/v0/amp-dailymotion-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-dailymotion/">Annotated code example for amp-dailymotion</a></td>
  </tr>
</table>

## Example

With responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos.

```html
<amp-dailymotion
    data-videoid="x2m8jpp"
    layout="responsive"
    width="480" height="270"></amp-dailymotion>
```

## Attributes

**autoplay**

If this attribute is present, and the browser supports autoplay:

* the video is automatically muted before autoplay starts
* when the video is scrolled out of view, the video is paused
* when the video is scrolled into view, the video resumes playback
* when the user taps the video, the video is unmuted
* if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it.  For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused. 

**data-videoid** (required)

The Dailymotion video id found in every video page URL. For example, `"x2m8jpp"` is the video id for `https://www.dailymotion.com/video/x2m8jpp_dailymotion-spirit-movie_creation`.

**data-mute** (optional)

Indicates whether to mute the video.

* Value: `"true"` or `"false"`
* Default value: `"false"`

**data-endscreen-enable** (optional)

Indicates whether to enable the end screen.

* Value: `"true"` or `"false"`
* Default value: `"true"`

**data-sharing-enable** (optional)

Indicates whether to display the sharing button.

* Value: `"true"` or `"false"`
* Default value: `"true"`

**data-start** (optional)

Specifies the time (in seconds) from which the video should start playing.

* Value: integer (number of seconds). For example, `data-start=45`.
* Default value: `0`

**data-ui-highlight** (optional)

Change the default highlight color used in the controls.

* Value: Hexadecimal color value (without the leading #). For example, `data-ui-highlight="e540ff"`.

**data-ui-logo** (optional)

Indicates whether to display the Dailymotion logo.

* Value: `"true"` or `"false"`
* Default value: `"true"`

**data-info** (optional)

Indicates whether to show video information (title and owner) on the start screen.

* Value: `"true"` or `"false"`
* Default value: `"true"`

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-dailymotion rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-dailymotion/validator-amp-dailymotion.protoascii) in the AMP validator specification.
