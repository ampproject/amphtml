---
$category@: media
formats:
  - websites
teaser:
  text: Embeds videos from 3Q SDN.
---

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

# amp-3q-player

## Example

With the `responsive` layout, the width and height in this should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-3q-player
  data-id="c8dbe7f4-7f7f-11e6-a407-0cc47a188158"
  layout="responsive"
  width="480"
  height="270"
></amp-3q-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong><strong>Examples</strong></td>
    <td>The dataid from 3Q SDN.</td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay (optional)</strong></td>
    <td ><p>If this attribute is present, and the browser supports autoplay:</p>
<ul>
  <li>the video is automatically muted before autoplay starts</li>
  <li>when the video is scrolled out of view, the video is paused</li>
  <li>when the video is scrolled into view, the video resumes playback</li>
  <li>when the user taps the video, the video is unmuted</li>
  <li>if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.</li>
</ul>
<p>for example <code>setModelRotation(x=0.5, xMin=0, xMax=3.14)</code> will change <code>x</code> component of rotation to <code>1.57</code>.</p></td>
  </tr>
  <tr>
    <td width="40%"><strong><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-3q-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-3q-player/validator-amp-3q-player.protoascii) in the AMP validator specification.
