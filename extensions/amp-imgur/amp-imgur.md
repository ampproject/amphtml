---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Imgur post.
---

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

# amp-imgur

## Usage

This extension creates an iframe and displays an [imgur](http://imgur.com) post.

```html
<amp-imgur
  data-imgur-id="f462IUj"
  layout="responsive"
  width="540"
  height="663"
></amp-imgur>
```

## Attributes

### data-imgur-id (required)

The ID of the Imgur post.

### width (required)

The width of the Imgur post.

### height (required)

The height of the Imgur post.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Validation

See [amp-imgur rules](validator-amp-imgur.protoascii) in the AMP validator specification.
