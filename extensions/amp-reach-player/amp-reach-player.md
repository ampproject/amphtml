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


# <a name="amp-reach"></a> `amp-reach-player`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays the Reach Player configured in the <a href="http://beachfrontreach.com">Beachfront Reach</a> platform.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-reach-player" src="https://cdn.ampproject.org/v0/amp-reach-player-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
    <a href="https://ampbyexample.com/components/amp-reach-player/">Annotated code example for amp-reach-player</a>
    </td>
  </tr>
</table>

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-reach-player
      data-embed-id="default"
      layout="responsive"
      width="560"
      height="315">
</amp-reach-player>
```

## Attributes

**data-embed-id**

The Reach player embed id found in the "players" section or in the generated embed itself.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-reach-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-reach-player/0.1/validator-amp-reach-player.protoascii) in the AMP validator specification.
