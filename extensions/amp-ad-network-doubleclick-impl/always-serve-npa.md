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

# Always Serve NPA

`always-serve-npa` provides a way to utilize the `<amp-geo>` component to detect user's geo location to decide if a non-personalized ad should be requested, regardless of the [user's consent decision](amp-consent.md). The value of `always-serve-npa` should be a comma delimited string of geo group codes which are defined in `<amp-geo>` (details [here](https://github.com/ampproject/amphtml/blob/master/extensions/amp-geo/amp-geo.md)). If no value is found or an empty string is provided, then a NPA will always be requested, regardless of the location.

```html
<amp-ad
  width="320"
  height="50"
  always-serve-npa="geoGroup1,geoGroup2"
  type="doubleclick"
  data-slot="/4119129/mobile_ad_banner"
>
</amp-ad>

<amp-geo>
  <script type="application/json">
    {
      "ISOCountryGroups": {
        "geoGroup1": [ "preset-eea", "unknown" ],
        "geoGroup2": [ "preset-us-ca" ]
      }
    }
  </script>
</amp-geo>
```
