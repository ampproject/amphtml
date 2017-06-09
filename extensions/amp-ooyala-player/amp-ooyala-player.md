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

# <a name="amp-ooyala-player"></a> `amp-ooyala-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays an <a href="https://www.ooyala.com/">Ooyala</a> video.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ooyala-player" src="https://cdn.ampproject.org/v0/amp-ooyala-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, flex-item, responsive</td>
  </tr>
</table>

## Example

```html
<amp-ooyala-player
    data-embedcode="Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ"
    data-pcode="5zb2wxOlZcNCe_HVT3a6cawW298X"
    data-playerid="6440813504804d76ba35c8c787a4b33c"
    width="640" height="360"></amp-ooyala-player>
```

## Attributes

**data-embedcode** (required)

The video embed code from [Backlot](https://backlot.ooyala.com).

**data-playerid** (required)

The ID of the player to load from [Backlot](https://backlot.ooyala.com).

**data-pcode** (required)

The provider code for the account owning the embed code and player.

**data-playerversion** (optional)

Specifies which version of the Ooyala player to use, V3 or V4. Defaults to V3.

**data-config** (optional)

Specifies a skin.json config file URL for player V4.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-ooyala-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-ooyala-player/0.1/validator-amp-ooyala-player.protoascii) in the AMP validator specification.
