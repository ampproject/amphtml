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

# <a name="amp-3q-player"></a> `amp-3q-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Embeds Videos from <a href="https://www.3qsdn.com/en/">3Q SDN</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>In Development</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-3q-player" src="https://cdn.ampproject.org/v0/amp-3q-player-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, flex-item, responsive</td>
  </tr>
</table>

## Example

``` html
<amp-3q-player
    data-id="c8dbe7f4-7f7f-11e6-a407-0cc47a188158"
    width="100%" height="100%"></amp-3q-player>
```

## Attributes

**data-id** (required)

sdnPlayoutId from 3Q SDN

**autoplay**

If this attribute is present, and the browser supports autoplay:

* the video is automatically muted before autoplay starts
* when the video is scrolled out of view, the video is paused
* when the video is scrolled into view, the video resumes playback
* when the user taps the video, the video is unmuted
* if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it.  For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.

## Validation

See [amp-3q-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-3q-player/0.1/validator-amp-3q-player.protoascii) in the AMP validator specification.
