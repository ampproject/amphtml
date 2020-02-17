---
$category@: presentation
formats:
  - websites
  - email
teaser:
  text: Displays a cloud-hosted TTS Trinity Audio Player
---

<!--
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# amp-trinity-tts-player

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a cloud-hosted TTS <a href="https://trinityaudio.ai/" target="_blank">Trinity Audio Player</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-trinity-tts-player" src="https://cdn.ampproject.org/v0/amp-trinity-tts-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fixed-height</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://amp.dev/documentation/examples/components/amp-trinity-tts-player/">Annotated code example for amp-trinity-tts-player</a></td>
  </tr>
</table>

## Usage

Player height should be set to `75`, for desktop or mobile.
`campaignId` is required.

```html
<amp-trinity-tts-player height="75" campaignId="XYZ"> </amp-trinity-tts-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>campaignId</strong></td>
    <td>Campaign ID. The only required parameter for component. (<strong>Required</strong>)</td>
  </tr>
</table>

## Validation

See [amp-trinity-tts-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-trinity-tts-player/validator-amp-trinity-tts-player.protoascii) in the AMP validator specification.
