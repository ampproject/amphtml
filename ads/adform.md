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

# Adform

## Examples

### Simple ad tag with `data-bn`

```html
<amp-ad width="320" height="50"
    type="adform"
    data-bn="12345">
</amp-ad>
```

### Ad placement with `data-mid`

```html
<amp-ad width="320" height="50"
    type="adform"
    data-mid="12345">
</amp-ad>
```

### Ad tag or placement with `src`

```html
<amp-ad width="320" height="50"
    type="adform"
    src="https://track.adform.net/adfscript/?bn=4849385;msrc=1">
</amp-ad>
```

## Configuration

Please refer to [Adform Help Center](https://www.adform.com/passport/) for more
information on how to get required ad tag or placement IDs. 

### Supported parameters

Only one of the mentioned parameters should be used at the same time.

- `data-bn`
- `data-mid`
- `src`: must use https protocol and must be from one of the
allowed Adform hosts.





