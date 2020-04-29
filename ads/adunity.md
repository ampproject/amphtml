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

# AdUnity

## Example

```html
<amp-ad
  type="adunity"
  width="300"
  height="250"
  data-au-account="xxx"
  data-au-site="xxx"
  data-au-section="xxx"
  data-au-zone="xxx"
>
</amp-ad>
```

## Configuration

### Required attributes

`data-au-account` - account number
`data-au-site` - site id

### Optional attributes

`data-au-section` - section of the site (i.e. hp - homepage), can be empty value
`data-au-zone` - zone id of the ad
`data-au-dual` - this is used to fetch ads for both desktop and mobile devices automatically
`data-au-isdemo` - used to fetch demo ad

### Other attributes

For more information please see ad network documentation at <https://kb.adunity.com>
