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
    <td>
    An <code>amp-reach-player</code> component displays the Reach Player configured in the <a href="https://platform.beachfrontreach.com">Beachfront Reach</a> platform.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Beta</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-reach-player" src="https://cdn.ampproject.org/v0/amp-reach-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
    <a href="https://github.com/ampproject/amphtml/blob/master/examples/reach-player.amp.html">reach-player.amp.html</a>
    </td>
  </tr>
</table>

The following lists validation errors specific to the `amp-reach-player` tag

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
    <tr>
      <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">The mandatory attribute 'data-embed-id' is missing in tag 'amp-reach-player'.</a></td>
      <td>Error thrown when <code>data-embed-id</code> attribute is missing.</td>
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
</amp-reach>
```

## Attributes

**data-embed-id**

The Reach player embed id found in the "players" section or in the generated embed itself.

