<!---
Copyright 2016 Kaltura. All Rights Reserved.

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

# <a name="amp-kaltura-player"></a> `amp-kaltura-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>An <code>amp-kaltura-player</code> component displays the Kaltura Player as used in Kaltura's <a href="https://corp.kaltura.com/">Video Platform</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-kaltura-player" src="https://cdn.ampproject.org/v0/amp-kaltura-player-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-kaltura-player/">Annotated code example for amp-kaltura-player</a></td>
  </tr>
</table>

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
 <amp-kaltura-player
      data-uiconf="33502051"
      data-partner="1281471"
      data-entryid="1_3ts1ms9c"
      data-param-streamerType = "auto"
      layout="responsive" width="480" height="270">
  </amp-kaltura-player>
```

## Attributes

**data-partner**

The Kaltura partner id. This attribute is mandatory.

**data-uiconf**

The Kaltura player id - uiconf id.

**data-entryid**

The Kaltura entry id.


**data-param-***

All `data-param-*` attributes will be added as query parameter to the player iframe src. This may be used to pass custom values through to player plugins, such as ad parameters or video ids for Perform players.

Keys and values will be URI encoded. Keys will be camel cased.

- `data-param-streamerType="auto"` becomes `&flashvars[streamerType]=auto`

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-kaltura-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-kaltura-player/0.1/validator-amp-kaltura-player.protoascii) in the AMP validator specification.
