<!--
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# <a name="`amp-audioburst-audio`"></a> `amp-audioburst-audio`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a <a href="https://audioburst.com">Audioburst</a> mobile audio player</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-audioburst-audio" src="https://cdn.ampproject.org/v0/amp-audioburst-audio-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed-height</td>
  </tr>
  <!--<tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>FILL THIS IN</td>
  </tr>-->
</table>

## Behavior

This extension allows to play audio with look and feel of Audioburst audio player.

## Example

```html
<amp-audioburst-audio
    autoplay
    layout="fixed-height"
    height="315"
    src="https://sapi.audioburst.com/audio/repo/play/web/l1AXp9wBR57y.mp3"
    fullShow="http://storageaudiobursts.blob.core.windows.net/temp/11760_2018081122_t.mp3"
    fullShowPosition="640"></amp-audioburst-audio>
```

## Attributes

##### src
Source URL for burst file.

##### fullShow (optional)
Source URL for full episode file.

##### fullShowPosition (required if fullShow set)
Starting point of current burst in full episode in seconds.

## Validation
See [amp-audioburst-audio rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-audioburst-audio/validator-amp-audioburst-audio.protoascii) in the AMP validator specification.
