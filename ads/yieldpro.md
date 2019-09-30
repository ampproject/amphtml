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

# YieldPro

## Examples

### Single ad

```html
<amp-ad width="728" height="90"
  type="yieldpro" 
  data-pubnetwork="12c6fc06"
  data-section-id="100"
  data-slot="107" >
</amp-ad>
```

### Multi instance ads

```html
<amp-ad width="250" height="250"
  type="yieldpro"
  data-pubnetwork="12c6fc06"
  data-section-id="475"
  data-slot="650"
  data-instance="1" >
</amp-ad>
<amp-ad width="250" height="250"
  type="yieldpro"
  data-pubnetwork="12c6fc06"
  data-section-id="475"
  data-slot="650"
  data-instance="2" >
</amp-ad>
```

### Using custom params and custom ad server url

```html
<amp-ad width="728" height="90"
  type="yieldpro" 
  data-pubnetwork="12c6fc06"
  data-section-id="100"
  data-slot="107"
  data-custom='{"my_custom_param":"my_custom_value"}'
  data-ad-server-url="//creative.yieldpro.eu/ad" >
</amp-ad>
```

## Configuration


For details on the configuration semantics, please contact the ad network or refer to their documentation. 

### Required parameters

- `sectionId`: ID of this section in ad server.
- `slot`: ID of ad slot in ad server.
- `pubnetwork`: ID of the publisher that in ad server.

### Optional parameters

- `instance`: ID of section instance in case we multiple times used the same section on the same page. Can contain only letters and numbers.Strictly required to use the same section multiple times per page.
- `click3rd`: 3rd party click watcher. 
- `adServerUrl` 
- `cacheSafe`
- `pageIdModifier`
- `custom`: Custom targeting properties. You may use 3 types for its properties: `{String}`, `{Number}` and `{Array}`. The following array usage example translates into: `arrayKey=value1&arrayKey=1&stringKey=stringValue...`

  ```text
  {
      arrayKey: [ "value1", 1 ],
      stringKey: 'stringValue'
  }
  ```
                    

