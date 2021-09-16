---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Displays dynamic content from the BySide service.
---

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

# amp-byside-content

Displays dynamic content from the [BySide service](http://www.byside.com/).

## Behavior

The `amp-byside-content` component is available for BySide customers and
displays dynamic content that can be retrieved from the [BySide](http://www.byside.com/) customization mechanisms.

Example:

The `width` and `height` attributes determine the aspect ratio of the embedded BySide content in responsive layouts.

```html
<amp-byside-content
  data-webcare-id="D6604AE5D0"
  data-label="amp-responsive"
  data-webcare-zone="we2"
  data-lang="en"
  width="1024"
  height="500"
  layout="responsive"
>
</amp-byside-content>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-webcare-id (required)</strong></td>
    <td>The BySide customer account ID.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-label (required)</strong></td>
    <td>The content label as seen in your BySide account.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-webcare-zone</strong></td>
    <td>The webcare zone property, as specified in the BySide customer account geographic zone. Defaults to main zone ("we1").</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-lang</strong></td>
    <td>The language to show the contents in, as specified in the BySide customer account localization. Defaults to Portuguese ("pt").</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-channel</strong></td>
    <td>The channel identifier to use for content validation. Defaults to an empty string.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-fid</strong></td>
    <td>The visitor force id. Use this when a unique visitor identifier is available, usually for authenticated users. Defaults to an empty string.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Privacy and cookies policy

[BySide](http://www.byside.com) is committed to respect and protect your privacy and developing technology that gives you the most powerful and safe online experience. BySide privacy statement and cookies policy can be found on the following url's:

- [http://www.byside.com/privacy.html](http://www.byside.com/privacy.html)
- [http://www.byside.com/cookies.html](http://www.byside.com/cookies.html)

## Validation

See [amp-byside-content rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-byside-content/validator-amp-byside-content.protoascii) in the AMP validator specification.
