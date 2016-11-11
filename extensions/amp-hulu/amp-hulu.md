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

# <a name="amp-hulu"></a> `amp-hulu`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a Hulu simple embed.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-hulu" src="https://cdn.ampproject.org/v0/amp-hulu-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Example

```html
<amp-hulu width="412" height="213" layout="responsive"
  data-eid="Bx6H30RBVFNpOe-iiOxp3A">
</amp-hulu>
```

## Attributes

**data-eid**

In a URL like https://secure.hulu.com/embed.html?eid=Bx6H30RBVFNpOe-iiOxp3A `Bx6H30RBVFNpOe-iiOxp3A` is the eid.

