---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Speechkit player.
---

<!--
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# `amp-speechkit`

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-projectid</strong></td>
    <td>This attribute is required<br />
The project you wish to play audio from.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-podcastid</strong></td>
    <td>This attribute is required if <code>data-externalid</code> or <code>data-articleurl</code> is not defined.
The podcast ID from SpeechKit API response. Either this or one of two other parameters below has to be provided.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-externalid</strong></td>
    <td>This attribute is required if <code>data-podcastid</code> or <code>data-articleurl</code> is not defined.
The article ID in your CMS.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-articleurl</strong></td>
    <td>This attribute is required if <code>data-podcastid</code> or <code>data-externalid</code> is not defined.
The related article URL for the audio.</td>
  </tr>
  <tr>
    <td width="40%"><strong>height</strong></td>
    <td>The layout for <code>amp-speechkit</code> is set to <code>fixed-height</code> and it fills all of the available horizontal space. This is ideal for the "Classic" mode.</td>
  </tr>
</table>

[example preview=”top-frame” playground=”true”]

```html
<head>
  <script
    custom-element="amp-speechkit"
    async
    src="https://cdn.ampproject.org/v0/amp-speechkit-latest.js"
  ></script>
</head>
<body>
  <amp-speechkit
    height="40"
    layout="fixed-height"
    data-projectid="6673"
    data-podcastid="534513"
  >
  </amp-speechkit>
</body>
```

[/example]

## Validation

See [amp-speechkit rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-speechkit/validator-amp-speechkit.protoascii) in the AMP validator specification.
