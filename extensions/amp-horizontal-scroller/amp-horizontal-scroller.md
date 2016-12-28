<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-horizontal-scroller"></a> `amp-horizontal-scroller`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides horizontal overflow scrolling for content of predictable height.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>In development</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-horizontal-scroller" src="https://cdn.ampproject.org/v0/amp-horizontal-scroller-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>XXX</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>TBD</td>
  </tr>
</table>

## Behavior

An `amp-horizontal-scroller` component is essentially a wrapper that provides scrolling for content
that cannot be fit into the available width but that one does not want to truncate with
`overflow: hidden`. The quintessential example is an HTML `table` with too much content to fit.

**Example**:

```html
<amp-horizontal-scroller>
  <table>
    …
  </table>
</amp-horizontal-scroller>
```

## Attributes

N/A

## Styling
- You may use the `amp-horizontal-scroller` element selector to style it freely.

## Validation

See [amp-horizontal-scroller rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-horizontal-scroller/0.1/validator-amp-horizontal-scroller.protoascii) in the AMP validator specification.
