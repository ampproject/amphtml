<!---
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# amp-ad-network-sulvo-impl

Sulvo implementation of AMP Ad tag.

<table>
  <tr>
    <td class="col-fourty" width="50%"><strong>Availability</strong></td>
    <td>In Development</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
</table>

## Example

### Regular ad

```html
<amp-ad
  width="300"
  height="250"
  type="sulvo"
  data-ad="example.com_display"
  class="demand-supply"
>
</amp-ad>
```

### Sticky ad

```html
<amp-sticky-ad>
  <amp-ad
    width="300"
    height="250"
    type="sulvo"
    data-ad="example.com_sticky_mobile"
    class="demand-supply"
  >
  </amp-ad>
</amp-sticky-ad>
```

## Configuration

For further information, please contact [Sulvo](https://sulvo.com/).

### Required parameters

- `data-ad`: Ad ID provided by Sulvo.
