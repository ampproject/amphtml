---
$category@: ads-analytics
formats:
  - ads: 
teaser:
  text: Provides viewability prediction to ads.
---
<!--
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

# amp-browsi

Provides realtime viewability prediction to ads on AMP pages using Browsi Prediction Service.  

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-browsi" src="https://cdn.ampproject.org/v0/amp-browsi-0.1.js">&lt;/script></code></td>
  </tr>
   <tr>
      <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
      <td>nodisplay</td>
    </tr>
  <!--
    <tr>
      <td class="col-fourty"><strong>Examples</strong></td>
      <td><a href="https://ampbyexample.com/components/amp-browsi/">Annotated code example for amp-browsi</a></td>
    </tr>
  -->
</table>

## Behavior

The `amp-browsi` extension detects all ads on page and uses `rtc-config` attribute to call **Browsi Viewability Predictor**
service which will return a targeting object that will be sent to the adServer.

`amp-browsi` collects data to allow **Browsi Viewability Predictor Service** to provide accurate predictions.   

## Example

```html
<amp-browsi
    pub-key="98569856"
    site-key="1234"
    layout="nodisplay">
</amp-browsi>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>pub-key</strong></td>
    <td>The `pub-key` attribute identify the publisher's id so Browsi could return the correct prediction</td>
  </tr>
  <tr>
      <td width="40%"><strong>site-key</strong></td>
      <td>The `site-key` attribute identify the publisher's site id so Browsi could return the correct prediction</td>
    </tr>
</table>


<!--
## Validation
See [amp-browsi rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-browsi/validator-amp-browsi.protoascii) in the AMP validator specification.
-->
