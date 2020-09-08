---
$category@: dynamic-content
formats:
  - websites
  - stories
teaser:
  text: Creates an iframe and displays a GitHub Gist.
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

# amp-gist

## Usage

Creates an iframe and displays a [GitHub Gist](https://docs.github.com/en/github/writing-on-github/creating-gists).

The following example shows how to embed multiple files:

```html
<amp-gist
  data-gistid="b9bb35bc68df68259af94430f012425f"
  layout="fixed-height"
  height="225"
>
</amp-gist>
```

The following example shows how to embed a single file:

```html
<amp-gist
  data-gistid="a19e811dcd7df10c4da0931641538497"
  data-file="hi.c"
  layout="fixed-height"
  height="185"
>
</amp-gist>
```

## Attributes

### `data-gistid`

The ID of the gist to embed.

### `layout`

Currently only supports `fixed-height`.

### `height`

The initial height of the gist or gist file in pixels.

[tip type="note"]

You should obtain the height of the gist by inspecting it with your browser
(e.g., Chrome Developer Tools). Once the Gist loads the contained iframe will
resize to fit so that its contents will fit.

[/tip]

### `data-file` (optional)

If specified, display only one file in a gist.

## Validation

See [amp-gist rules](validator-amp-gist.protoascii) in the AMP validator specification.
