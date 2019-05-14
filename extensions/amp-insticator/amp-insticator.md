---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Displays an Insticator embed.
---
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

# amp-insticator

Displays an <a href="https://www.insticator.com">Insticator</a> embed.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-insticator" src="https://cdn.ampproject.org/v0/amp-insticator-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-insticator/">Annotated code example for amp-insticator</a></td>
  </tr>
</table>

[TOC]

## Behavior

Implement the below element into your website code in the location you wish to see it visually appear on your website.

Example:
```html
<amp-insticator
    data-embed-id="06538eab-6e13-4e71-8584-8501a8e85f7b">
</amp-insticator>
```

This element will generate an <a href="https://www.insticator.com">Insticator</a> embed, a white-labeled content engagement unit. The unit will pose contextually relevant quiz and poll questions to your audience while monetizing via accompanying advertisements.

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-embed-id</strong></td>
    <td>Unique identifier of your custom embed.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>


## Validation
See [amp-insticator rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-insticator/validator-amp-insticator.protoascii) in the AMP validator specification.
