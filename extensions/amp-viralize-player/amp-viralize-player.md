---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Viralize content player.
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

# `amp-viralize-player`

An `amp-viralize-player` component displays the [Viralize player](https://viralize.com/player/).

## Usage

In the following an example of component usage:

```html
<amp-viralize-player
  data-zid="example-of-unit-zid"
  layout="responsive"
  width="320"
  height="180"
>
</amp-viralize-player>
```

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

## Attributes

### `data-zid`

The Viralize platform player id that can be found in the your Viralize dashboard.

### `data-extra` (optional)

JSON object representing any other query parameter that could be used to configure the Viralize player.

Example:

```html
<amp-viralize-player
  data-zid="example-of-unit-zid"
  layout="responsive"
  width="320"
  height="180"
  data-extra='{"u": "www.example.org"}'
>
</amp-viralize-player>
```

### common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

Note that only [Responsive layout](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md#layout) is currently supported.

## Validation

See [amp-viralize-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-viralize-player/validator-amp-viralize-player.protoascii) in the AMP validator specification.
