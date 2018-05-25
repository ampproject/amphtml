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

# Fusion

## Example

```html
<<<<<<< HEAD
<amp-ad width="600" height="100"
=======
<amp-ad width=600 height=100
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
    type="fusion"
    data-ad-server="bn-01d.adtomafusion.com"
    data-media-zone="adtomatest.apica"
    data-layout="apicaping"
    data-space="apicaAd"
    data-parameters="age=99&isMobile&gender=male">
</amp-ad>
```

## Configuration

<<<<<<< HEAD
For configuration and implementation details, please contact the Fusion support team: support@adtoma.com

Supported parameters:

- `data-ad-server`
- `data-media-zone`
- `data-layout`
- `data-space`
- `data-parameters`

Parameters should be passed as `key&value` pairs `&` separated. Missing value equals `true`. So `...&isMobile&...` from the example above stands for `...&isMobile=true&...`. 
=======
For configuration and implementation details, please contact Fusion support team support@adtoma.com

Supported parameters:

- data-ad-server
- data-media-zone
- data-layout
- data-space
- data-parameters

Parameters should be passed as key&value pairs '&' separated. Missing value equals 'true'. 
So '...&isMobile&...' from example above stands for '...&isMobile=true&...'. 
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
