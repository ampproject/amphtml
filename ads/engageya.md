<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# Engageya

## Example of Engageya's widget implementation

### Basic

```html
<amp-embed width="200" height="200"
    type="engageya"
    layout="responsive"
    data-widgetIds="WID_1,WID_2"
    data-websiteId="WEBID_1"
    data-publisherId="PUBID_1">
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation. 

### Required parameters

- `data-widgetIds`: Widget ids 
- `data-websiteId`: Website Id
- `data-publisherId`: Publisher Id

### Optional parameters

- `data-url`: Current none amp version URL
- `data-ampUrl`: Current AMP page URL
- `data-styleCSS`: Additional style
