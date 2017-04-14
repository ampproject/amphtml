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

# <a name="amp-springboard-player"></a> `amp-springboard-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays the Springboard Player used in the <a href="http://publishers.springboardplatform.com">Springboard</a> Video Platform.
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-springboard-player" src="https://cdn.ampproject.org/v0/amp-springboard-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, flex-item, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-springboard-player/">Annotated code example for amp-springboard-player</a></td>
  </tr>
  </tr>
</table>

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

**data-site-id** (required)

The SpringBoard site ID. Specific to every partner.

**data-mode** (required)

The SpringBoard player mode: `video` or `playlist`.

**data-content-id** (required)

The SpringBoard player content ID (video or playlist ID).

**data-player-id** (required)

The Springboard player ID.

**data-domain** (required)

The Springboard partner domain.

**data-items** (required)

The number of videos in the playlist.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-springboard-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-springboard-player/0.1/validator-amp-springboard-player.protoascii) in the AMP validator specification.
