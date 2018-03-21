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
    <td>Displays dynamic content from the <a href="http://www.byside.com/">BySide service</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-byside-content" src="https://cdn.ampproject.org/v0/amp-byside-content-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Behavior

The `amp-byside-content` component is available for BySide customers and  
displays dynamic content that can be retrieved from the [BySide](http://www.byside.com/) customization mechanisms.

Example:


The `width` and `height` attributes determine the aspect ratio of the embedded BySide content in responsive layouts.

```html
<amp-byside-content
    data-webcare-id="D6604AE5D0"
    data-label="amp-responsive"
    data-lang="en"
    width="1024"
    height="500"
    layout="responsive">
</amp-byside-content>
```

## Attributes

##### data-webcare-id (required)

The BySide customer account ID.

##### data-label (required)

The content label as seen in your BySide account.

##### data-lang

The language to show the contents in, as specified in the BySide customer account localization. Defaults to Portuguese ("pt").

#####  data-channel

The channel identifier to use for content validation. Defaults to an empty string.

##### data-fid

The visitor force id. Use this when a unique visitor identifier is available, usually for authenticated users. Defaults to an empty string.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Privacy and cookies policy

[BySide](http://www.byside.com) is committed to respect and protect your privacy and developing technology that gives you the most powerful and safe online experience. BySide privacy statement and cookies policy can be found on the following url's:

* [http://www.byside.com/privacy.html](http://www.byside.com/privacy.html)
* [http://www.byside.com/cookies.html](http://www.byside.com/cookies.html)

## Validation
See [amp-byside-content rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-byside-content/validator-amp-byside-content.protoascii) in the AMP validator specification.
