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

# DotAndAds

## Examples

#### 300x250 box

```html
<amp-ad width="300" height="250"
    type="dotandads"
    data-sp="300x250-u"
    data-mpo="ampTest"
    data-mpt="amp-amp-all-all">
</amp-ad>
```

#### 980x250 masthead

```html
<amp-ad width="980" height="250"
    type="dotandads" 
    data-sp='sn-u' 
    data-cid="11" 
    data-mpo="ampTest" 
    data-mpt="amp-amp-all-all">
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation. 

Supported parameters:

- `sp`: sizepos (the ad size and position code)
- `mpo`: multipoint (an extraction parameter based on site)
- `mpt`: mediapoint tag (the box where the ad will be shown)
- `cid`: customer id
