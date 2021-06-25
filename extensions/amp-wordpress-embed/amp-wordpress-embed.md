---
$category@: presentation
formats:
  - websites
teaser:
  text: Embeds a WordPress post.
experimental: true
bento: true
---

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

# amp-wordpress-embed

## Behavior

This extension creates an iframe and displays the [excerpt](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/) of a WordPress post.

#### Example: Embedding a WordPress post

```html
<amp-wordpress-embed
    data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
    layout="fixed"
    height="400"
    width="600">
</amp-wordpress-embed>
```

## Attributes

##### data-url (required)

The URL of the post to embed.

##### height

The initial height of the WordPress post embed in pixels.

## Validation

See [amp-wordpress-embed rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-wordpress-embed/validator-amp-wordpress-embed.protoascii) in the AMP validator specification.
