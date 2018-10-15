<!--
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# <a name="`amp-imgur`"></a> `amp-imgur`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays an <a href="http://imgur.com">Imgur</a> post.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-imgur" src="https://cdn.ampproject.org/v0/amp-imgur-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

[TOC]

## Behavior

This extension creates an iframe and displays an [imgur](http://imgur.com) post. 

Example: 

```html
<amp-imgur data-imgur-id="f462IUj"
    layout="responsive"
    width="540"
    height="663"></amp-imgur>
```

## Attributes

##### data-imgur-id (required)

The ID of the Imgur post.

##### width (required)

The width of the Imgur post.

##### height (required)

The width of the Imgur post.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation
See [amp-imgur rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-imgur/validator-amp-imgur.protoascii) in the AMP validator specification.
