<!--
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# <a name="`amp-wordpress-embed`"></a> `amp-wordpress-embed`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Embeds a <a href="https://wordpress.org/">WordPress post</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-wordpress-embed" src="https://cdn.ampproject.org/v0/amp-wordpress-embed-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed-height</td>
  </tr>
  <!-- <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-wordpress-embed/">Annotated code example for amp-wordpress-embed</a></td>
  </tr> -->
</table>

[TOC]

## Behavior

This extension creates an iframe and displays the [excerpt](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/) of a WordPress post. 

#### Example: Embedding a WordPress post

```html
<amp-wordpress-embed
    data-url="https://wordpress.example.com/post-title/"
    layout="fixed-height"
    height="240">
</amp-wordpress-embed>
```

## Attributes

##### data-url (required)

The URL of the post to embed.

##### layout (required)

Currently only supports `fixed-height`.

##### height (required)

The initial height of the WordPress post embed in pixels.

## Validation
See [amp-wordpress-embed rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-wordpress-embed/validator-amp-wordpress-embed.protoascii) in the AMP validator specification.
