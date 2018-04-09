<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# AdsNative

## Example

```html
<amp-ad width="300" height="250"
    type="adsnative"
    data-anapiid="123456">
</amp-ad>
```

## Configuration

For configuration details, see [AdsNative's documentation](http://dev.adsnative.com).

### Required parameters

- `width`:        required by amp
- `height`:       required by amp
- `data-anapiid`: the api id may be used instead of network and widget id
- `data-annid`:   the network id must be paired with widget id
- `data-anwid`:   the widget id must be paired with network id

### Optional parameters

- `data-anapiid`: the api id
- `data-anwid`:   the widget id
- `data-antid`:   the template id
- `data-ancat`:   a comma separated list of categories
- `data-ankv`:    a list of key value pairs in the format `"key1:value1, key2:value2"`.
