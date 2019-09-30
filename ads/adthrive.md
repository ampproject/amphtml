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

# AdThrive

Your site must be approved and active with [AdThrive](http://www.adthrive.com) prior to use. AdThrive will install or provide specific tags for your site.

## Examples

### Render an ad with the default sizes
```html
  <amp-ad width="320" height="50"
      type="adthrive"
      data-site-id="test"
      data-ad-unit="AdThrive_Content_1">
  </amp-ad>
```

### Render an ad with a fixed size 320x50
```html
  <amp-ad width="320" height="50"
      type="adthrive"
      data-site-id="test"
      data-ad-unit="AdThrive_Content_1"
      data-sizes="320x50">
  </amp-ad>
```

### Render an ad with multiple sizes (320x50,320x100,300x250)
```html
  <amp-ad width="320" height="50"
      type="adthrive"
      data-site-id="test"
      data-ad-unit="AdThrive_Content_1"
      data-sizes="320x50,320x100,300x250">
  </amp-ad>
```

## Configuration

### Required parameters

* `data-site-id` - Your AdThrive site id.
* `data-ad-unit` - AdThrive provided ad unit.

### Optional parameters

`data-sizes` - Comma separated list of ad sizes this ad slot should support. The iFrame will be resized if allowed.
