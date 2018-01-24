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

# <a name="`amp-byside-content`"></a> `amp-byside-content`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays dynamic placeholder content from BySide service.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Available for BySide customers with a valid client id.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-byside-content-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See <a href="https://ampbyexample.com/components/amp-byside-content/">annotated code example for amp-byside-content</a></td>
  </tr>
</table>

## Behavior

An `amp-byside-content` component displays dynamic content that can be retrieved from the [BySide](https://www.byside.com) customization mechanisms, for a valid BySide client.

The `data-webcare-id` and `data-label` attributes are required for the content embed to work.

Example:
```html
<amp-byside-content
	data-webcare-id="D6604AE5D0"
	data-label="amp"
	data-lang="en"
	width="400"
	height="400"
	layout="responsive"
	resizable>
</amp-byside-content>
```

## Attributes

**data-webcare-id**

The **required** BySide customer account id.

**data-channel**

The channel identifier to use for content validation. Defaults to empty string "".

**data-lang**

The language to show contents, as available in BySide customer account localization. Defaults to portuguese "pt".

**data-fid**

The visitor force id. Use this when a unique visitor identifier is available, usually for authenticated users. Defaults to empty "".

**data-label**

The **required** placeholder content label as seen in your backoffice account.

## Validation
See [amp-byside-content rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-byside-content/validator-amp-byside-content.protoascii) in the AMP validator specification.
