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

# <a name="amp-analytics-resources"></a> Variables supported in `amp-analytics-resources`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Loading the `amp-analytics-resources` extension augments the set of URL replacement variables available to `amp-pixel` and `amp-analytics`.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-analytics-resources" src="https://cdn.ampproject.org/v0/amp-analytics-resources-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>FILL, FIXED, FIXED_HEIGHT, FLEX_ITEM, NODISPLAY, RESPONSIVE</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td></td>
  </tr>
</table>


## Page and content

### domExtImgCount

Provides the current document's count of image nodes on the page that referenced external URLs.

Example value: `8`

### domExtScriptCount

Provides the AMP document's count of script nodes on the page that referenced external URLs.

Example value: `12`

### domImgCount

Provides the current document's count of image nodes on the page.

Example value: `15`

### domNodeCount

Provides the current document's count of DOM nodes on the page.

Example value: `100`

### domScriptCount

Provides the current document's count of script nodes on the page.

Example value: `12`

### pageDocLength

Provides the current document's rendered byte count of base page. This may not be what was sent on the network.

Example value: `30000`

### pageDomainCount

Provides the current document's count of distinct domains referenced from the page.

Example value: `6`

### resourceCount

Provides the current document's count of resources.

See W3C Resource Timing API [PerformanceResourceTiming interface](https://www.w3.org/TR/resource-timing/) for more information.

Example value: `20`

### resourceTiming

Provides the current document's compressed resource timing data.

See W3C Resource Timing API [PerformanceResourceTiming interface](https://www.w3.org/TR/resource-timing/) for more information.

The data is formatted and compressed using the  [resourcetiming-compression](https://github.com/nicjansma/resourcetiming-compression.js) library.

The data may be large, it is recommended to be used with `amp-analytics` with a `transport` of `beacon` or `xhrpost`.
