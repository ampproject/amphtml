---
$category: ads-analytics
formats:
  - websites
teaser:
  text: Dynamically injects Denakop ads into an AMP page by using a remotely-served configuration file.
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

# `amp-denakop`
Displays <a href="https://denakop.com/">Denakop</a> ads.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-denakop" src="https://cdn.ampproject.org/v0/amp-denakop-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>NODISPLAY</td>
  </tr>
</table>

## Behavior

It contains features that aim to facilitate content producers day-to-day. It enables the activation and deactivation of advertising formats automatically and instantaneously.

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-tag-id (required)</strong></td>
    <td>The tag id.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-publisher-id (required)</strong></td>
    <td>The publisher id.</td>
  </tr>
  <tr>
    <td width="40%"><strong>layout</strong></td>
    <td>Default value: `"nodisplay"`</td>
  </tr>
</table>

## Validation
See [amp-denakop rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-denakop/validator-amp-denakop.protoascii) in the AMP validator specification.
