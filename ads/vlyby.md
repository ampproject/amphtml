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

# vlyby

## Example

```html
<amp-ad
  width="400"
  height="225"
  type="vlyby"
  heights="(min-width:1907px) 56%, (min-width:1100px) 64%, (min-width:780px) 75%, (min-width:480px) 105%, 200%"
  data-publisherid="00uh4p9ch0xd1vgYs0h7"
  data-placementid="Default"
  data-pubref="bunte.de"
>
</amp-ad>
```

## Configuration

Supported parameters:

All parameters are mandatory, only `data-pubref` is optional.

- `data-publisherid` (String, non-empty)
- `data-placementid` (String, non-empty)
- `data-pubref` (String)

