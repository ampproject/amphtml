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

# <a name="amp-samba-player"></a> `amp-samba-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays <a href="http://sambatech.com/">SambaTech</a> video player.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-samba-player" src="https://cdn.ampproject.org/v0/amp-samba-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-samba-player/">Annotated code example for amp-samba-player</a></td>
  </tr>
</table>

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts (16:9 in this case).

Example:

```html
<amp-samba-player
    data-project-id="442189dbff37920ceae523517366b5fd"
    data-media-id="32e56bfe9b1602fea761a26af305325a"
    layout="responsive"
    width="640" height="360">
</amp-samba-player>
```

Non-responsive layout is also supported.

Example:

```html
<amp-samba-player
    data-project-id="442189dbff37920ceae523517366b5fd"
    data-media-id="32e56bfe9b1602fea761a26af305325a"
    width="640" height="360">
</amp-samba-player>
```

## Attributes

**data-media-id**

The SambaTech platform media ID. This is an 32-digit hexadecimal sequence that identifies media content.

**data-project-id** (required)

The SambaTech platform project ID. This is an 32-digit hexadecimal sequence used to identify the publisher's project.

**data-param-***

All `data-param-*` attributes will be added as query parameter to the SambaPlayer iframe URL. This may be used to pass custom values through to SambaPlayer, such as whether to show controls, select default output quality, resume from a position, etc.

Keys and values will be URI encoded. Keys will be camel cased.

- `data-param-enable-controls=false` becomes `&enabledControls=false`

See [SambaTech's player documentation](http://dev.sambatech.com/documentation/player/) for more parameter options for SambaPlayer.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation
See [amp-samba-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-samba-player/0.1/validator-amp-samba-player.protoascii) in the AMP validator specification.
