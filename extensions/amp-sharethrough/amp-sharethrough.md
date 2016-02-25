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

# <a name="amp-sharethrough"></a>amp-sharethrough

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td> Displays a <a href="https://www.sharethrough.com/">Sharethrough</a> native ad.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-sharethrough" src="https://cdn.ampproject.org/v0/amp-sharethrough-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/sharethrough.amp.html">sharethrough.amp.html</a></td>
  </tr>
</table>

## Examples

```html
<amp-sharethrough height=657
    layout="fixed-height"
    data-native-key="abcd1234">
    </amp-soundcloud>
```

## Required attributes

**data-native-key**

The native or placement key for the ad unit, an hexadeximal string.

