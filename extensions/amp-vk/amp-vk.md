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

# <a name="`amp-vk`"></a> `amp-vk`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a VK Post or Poll embed</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-vk-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed, responsive, flex-item</td>
  </tr>
</table>

## Behavior

You can use the `amp-vk` component to embed a VK Post or VK Poll widget

Example of a Post widget:
```html
<amp-vk
    width="500"
    height="300"
    data-embedtype="post"
    layout="responsive"
    data-owner_id="1"
    data-post_id="45616"
    data-hash="Yc8_Z9pnpg8aKMZbVcD-jK45eAk">
</amp-vk>
```

Example of a Poll widget:
```html
<amp-vk
    width="400"
    height="300"
    layout="responsive"
    data-embedtype="poll"
    data-api_id="6183531"
    data-poll_id="274086843_1a2a465f60fff4699f">
</amp-vk>
```

## Attributes

For additional information about Post widget attributes please see <a href="https://vk.com/dev/widget_post">VK Post widget documentation</a>  

##### data-embedtype (required)

The type of embed, either `post` or `poll`.

##### data-owner_id

Owner id of a vk.com post. Supported when `data-embedtype` is `post`.

##### data-post_id

Post id of a post. Supported when `data-embedtype` is `post`.

##### data-hash

Security hash for the widget connection. Supported when `data-embedtype` is `post`.

##### data-api_id

API id of a Poll. Supported when `data-embedtype` is `poll`.

##### data-poll_id

Id of a poll. Supported when `data-embedtype` is `poll`.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation
See [amp-vk rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-vk/validator-amp-vk.protoascii) in the AMP validator specification.
