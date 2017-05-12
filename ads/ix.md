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

# Index Exchange

Index supports Header Tag style bidding using Doubleclick as the ad server.

## Example

```html
<amp-ad width=300 height=250
  type="ix"
  data-ix-id="54321"
  data-slot="/1234/example"
</amp-ad>
```

## Configuration

For semantics of configuration, please contact your account manager at Index Exchange.

If you use `remote.html` in your AMP pages, you must add `ix` into the array that outlines the list of acceptable types. For example, `['doubleclick']` should be changed to `['doubleclick', 'ix']`. If you do not use `remote.html`, this step is not required.

Ad size are based on the `width` and `height` attributes of the `amp-ad` tag. Neither width and height override attributes nor multi-size ads are currently supported.

__Required:__

- `data-ix-id`
- `data-slot`

__Optional:__

- `data-ix-slot`
- `data-ix-timeout`

__Unsupported:__

- `data-override-width`
- `data-override-height`
- `data-multi-size`
- `data-multi-size-validation`

Additional parameters including `json` will be passed through in the resulting call to DFP. For details please see the [Doubleclick documentation](https://github.com/ampproject/amphtml/blob/master/ads/google/doubleclick.md).

