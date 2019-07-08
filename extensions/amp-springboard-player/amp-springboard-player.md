---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Springboard Platform video player.
---
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

# amp-springboard-player

Displays the Springboard Player used in the <a href="http://publishers.springboardplatform.com">Springboard

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-springboard-player" src="https://cdn.ampproject.org/v0/amp-springboard-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, flex-item, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-springboard-player/">Annotated code example for amp-springboard-player</a></td>
  </tr>
  </tr>
</table>

[TOC]

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

```html
<amp-springboard-player
	data-site-id="261"
	data-mode="video"
	data-content-id="1578473"
	data-player-id="test401"
	data-domain="test.com"
	data-items="10"
	layout="responsive" width="480" height="270">
</amp-springboard-player>
```

## Attributes
<table>
  <tr>
    <td width="40%"><strong>data-site-id (required)</strong></td>
    <td>The SpringBoard site ID. Specific to every partner.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-mode (required)</strong></td>
    <td>The SpringBoard player mode: <code>video</code> or <code>playlist</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-id (required)</strong></td>
    <td>The SpringBoard player content ID (video or playlist ID).</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-player-id (required)</strong></td>
    <td>The Springboard player ID.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-domain (required)</strong></td>
    <td>The Springboard partner domain.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-items (required)</strong></td>
    <td>The number of videos in the playlist.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-springboard-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-springboard-player/validator-amp-springboard-player.protoascii) in the AMP validator specification.
