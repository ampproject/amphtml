<!---
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

# Imonomy

Imonomy supports Header Tag style bidding using Doubleclick as the ad server.

## Example

```html
<amp-ad width=728 height=90
  type="imonomy"
  data-pid="5656544455"
  data-sub-id="636gd"
  data-slot="/36653869/amp_imo_multi_size"
  data-extraParams='{"track_id":1}'
</amp-ad>
```

## Configuration

For semantics of configuration, please contact your account manager at Imonomy.

If you use `remote.html` in your AMP pages, you must add `imonomy` into the array that outlines the list of acceptable types. For example, `['doubleclick']` should be changed to `['doubleclick', 'imonomy']`. If you do not use `remote.html`, this step is not required.

Ad size is based on the `width` and `height` attributes of the `amp-ad` tag by default. Both width and height override attributes (`data-override-width` and `data-override-height`) and multi-size ads (via `data-multi-size`) are supported.

__Required:__

- `data-pid`
- `data-sub-id`
- `data-slot`

Additional parameters including `json` will be passed through in the resulting call to DFP. For details please see the [Doubleclick documentation](https://github.com/ampproject/amphtml/blob/master/ads/google/doubleclick.md).

