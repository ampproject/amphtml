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

# Dotandads

### <a name="amp-ad-network-dotandads-impl"></a> `amp-ad-network-dotandads-impl`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Google Ad Manager implementation of the AMP Ad tag.  Click <a href="/ads/google/a4a/docs/Network-Impl-Guide.md">here</a>
    for Fast Fetch details, and <a href="/extensions/amp-a4a/amp-a4a-format.md">here</a>
    for AMPHTML ad format details. This tag should
    not be directly referenced by pages and instead is dynamically loaded
    via the amp-ad tag.  However, in order to remove an async script load
    of this library, publishers can include its script declaration.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Launched</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="#examples">See Example Section</a></td>
  </tr>
</table>

### Supported Features

<table>
  <tr>
    <td><strong>Feature</strong></td>
    <td><strong>Description</strong></td>
    <td><strong>Status</strong></td>
  </tr>
  <tr>
    <td><a href="dotandads-rtc.md">Real Time Config</a></td>
    <td>Allows Publishers to augment ad requests with targeting information that is retrieved at runtime.</td>
    <td>Launched</td>
  </tr>
</table>

#### Examples
Example - Dotandads Ad
```html
<amp-ad width=728 height=90
    type="dotandads"
    data-mpt="mpt_example">
</amp-ad>
```
### Configuration

For semantics of configuration, please see [ad network documentation](https://developers.google.com/doubleclick-gpt/reference).


#### Ad size

By default the ad size is based on the `width` and `height` attributes of the `amp-ad` tag. In order to explicitly request different ad dimensions from those values, pass the attributes `data-override-width` and `data-override-height` to the ad.

Example:

```html
<amp-ad width=1270 height=250
type="dotandads"
data-cid="81"
data-mpo="rollingstone_amp"
data-mpt="lbdp_rs2014_amp"
data-sp='728x90_2'>
</amp-ad>
```