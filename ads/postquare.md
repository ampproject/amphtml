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

# Postquare

## Example of Postquare's widget implementation


```html
<amp-embed width="200" height="200"
    type="postquare"
    layout="responsive"
    data-widgetIds="WID_1,WID_2"
    data-websiteId="WEBID_1"
    data-publisherId="PUBID_1">
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact Postquare or refer to their documentation. 

### Required parameters

- `widgetIds`: Widget ids 
- `websiteId`: Website Id
- `publisherId`: Publisher Id

### Optional parameters
- `url`: Current none amp version URL
- `ampUrl`: Current AMP page URL
- `styleCSS`: Additional style
