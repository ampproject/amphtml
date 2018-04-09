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

# Nokta

## Example

```html
<amp-ad width="300" height="250" 
	  type="nokta" 
	  data-category="izlesene_anasayfa" 
	  data-site="izlesene:anasayfa" 
	  data-zone="152541">
    <div placeholder></div>
    <div fallback></div>
</amp-ad>
```


## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation. 

### Required parameters

* `data-category`: Site category for ad unit.
* `data-site`: Site descriptor for ad.
* `data-zone`: Zone id to show related ad.
