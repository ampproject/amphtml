<!---
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

# Rakuten Unified Ads

## Example

```html
<amp-ad width="300" height="250" type="rakutenunifiedads" data-id="63">
</amp-ad>
```

```html
<amp-ad
  width="300"
  height="250"
  type="rakutenunifiedads"
  data-id="63"
  data-env="dev"
  data-genre='{"master_id":1,"code":"100371","match":"children"}'
  data-ifa="DUMMY_IFA"
  data-targeting='{"k1":"string type","k2":["male", "female"]}'
  data-responsive="true"
>
</amp-ad>
```

## Configuration

### Required parameters

- `data-id` : Your adspot id
- `type` : fixed value `rakutenunifiedads`

### Optional parameters

- `data-env` : Environment of server for Not production. e.g. `dev`, `stg`, `tst`
- `data-genre` : Genre object
- `data-ifa` : IFA string
- `data-targeting` : Targeting object
- `data-responsive` : Boolean for responsive ad spot or not
