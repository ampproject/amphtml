# <a name="amp-viewer-assistance"></a> amp-viewer-assistance

[TOC]

<!---
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>The amp-viewer-assistance element provides specification of AMP viewer
configuration information and invocation of AMP viewer assisted behavior.</td>
  </tr>
  <tr>
    <td><strong>Availability</strong></td>
    <td>Stable</td>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-viewer-assistance" src="https://cdn.ampproject.org/v0/amp-viewer-assistance-0.1.js">&lt;/script></code>
      </div>
    </td>
  </tr>
</table>

## Example

```html
<script id="amp-viewer-assistance" type="application/json">
{
  "platformA": {
    "foo": 123,
    "bar": 456,
  },
  "platformB": {
    ...
  }
}
</script>
```
