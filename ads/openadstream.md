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

# Open AdStream (OAS)

## Examples

### Single ad

```html
<amp-ad width="300" height="250"
  type="openadstream" 
  data-adhost="oasc-training7.247realmedia.com" 
  data-sitepage="dx_tag_pvt_site" 
  data-pos="x04" 
  data-query="keyword=keyvalue&key2=value2" >
</amp-ad>
```

### Multi ads using coordinated positions 

```html
<amp-ad width="728" height="90" 
  type="openadstream" 
  data-adhost="oasc-training7.247realmedia.com" 
  data-sitepage="dx_tag_pvt_site" 
  data-pos="x50,x51!x50" >
</amp-ad>
<amp-ad width="300" height="250" 
  type="openadstream" 
  data-adhost="oasc-training7.247realmedia.com" 
  data-sitepage="dx_tag_pvt_site" 
  data-pos="x50,x51!x51" >
</amp-ad>
```
## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation. 

### Required parameters

- `adhost`: OAS cname. Must start with HTTPS.
- `sitepage`: Sitepage configured for this ad spot.
- `pos`: Position for the this ad spot.

### Optional parameters

- `query`: Query parameter to be sent with request. Keywords and keynames, taxonomy etc. 
