<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# Mediavine

## Examples

```html
  <amp-ad width=300 height=250
      type="mediavine"
      data-site="amp-project">
  </amp-ad>

  <amp-ad width=300 height=250
      type="mediavine"
      data-sizes="300x250,320x50"
      data-site="amp-project">
  </amp-ad>

```

## Configuration

__Required:__

`data-site` - The site's unique name this ad will be served on. This is the same name from your Mediavine script wrapper.

`width` + `height` - Required for all `<amp-ad>` units. Specifies the default fixed ad size. Will resize iframe for flex ads.

`data-sizes` - Comma separated list of ad sizes this placement should support. Will cause iframe resize if different from hard-coded width and height.

`type` - always set to "mediavine"

Each site must be approved and signed up with [Mediavine](http://www.mediavine.com) prior to launch. The site name will be the same as name in the Mediavine script wrapper. The site name `amp-project` can be used for testing and will serve placeholder ads.
