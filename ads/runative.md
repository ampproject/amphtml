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

# RUNative

Serves ads from the [RUNative](https://www.runative.com/).

## Example

```html
<amp-embed
  width="640"
  height="320"
  layout="responsive"
  type="runative"
  data-spot="{spotcode}"
  data-ad-type="{ad type}label-over"
  data-cols="{number cols}"
  data-rows="{number rows}"
  data-title="{title of ad}"
  data-keywords="{keywords}"
>
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

- `data-spot` - code spot

### Optional parameters

- `data-ad-type` - types of ads: `img-left`, `img-right`, `label-over`, `label-under`
- `data-keywords` - title of ad
- `data-title` - title of ad
- `data-cols` - number of cols 1 till 6
- `data-rows` - number of rows 1 till 6
- `data-title-position` - position of ad title (`left` or `right`)
- `data-ads-by-position` - position of runative logo (`left` or `right`)
