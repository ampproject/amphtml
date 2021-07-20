---
$category@: media
formats:
  - websites
teaser:
  text: Displays the Slike Player.
---

<!--
  All documentation starts with frontmatter. Front matter organizes documentation on amp.dev
  and improves SEO.
  * Include the relevant category(ies): ads-analytics, dynamic-content, layout, media, presentation, social, personalization
  * List applicable format(s): websites, ads, stories, email
  * Do not include markdown formatting in the frontmatter - plain text and punctionation only!
  * Remove this comment!
-->

<!--
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# amp-slike

<!--
  If the component is relevant for more than one format and operates differently between these
  formats, include and filter multiple content blocks and code samples.
-->

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layout.

Example:

```html
<amp-slike
  data-apikey="33502051"
  data-videoid="1281471"
  layout="responsive"
  width="480"
  height="270"
>
</amp-slike>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-apikey</strong></td>
    <td>The Slike apikey id. This attribute is mandatory.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-videoid</strong></td>
    <td>The Slike video content id - videoid. This attribute is mandatory</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-config</strong></td>
    <td>It is the player configuration passed as string and enentually capturen as query parameter. Few examples autoplay=true, skipad=true etc</td>
  </tr>

  <tr>
    <td width="40%"><strong>data-iframe-src</strong></td>
    <td>The iframe source can be overriden by users own source. The default template is binded the component</td>
  </tr> 
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>

## Validation

See [amp-slike rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-slike/validator-amp-slike.protoascii) in the AMP validator specification.
