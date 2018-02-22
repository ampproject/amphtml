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

# Sortable

## Examples

```html
  <amp-ad width=728 height=90
      type="sortable"
      data-name="728x90_amp"
      data-site="ampproject.org">
  </amp-ad>

  <amp-ad width=300 height=250
      type="sortable"
      data-name="medrec"
      data-site="ampproject.org">
  </amp-ad>

  <!-- Responsive Ad -->

  <amp-ad width=300 height=250
      type="sortable"
      data-name="medrec"
      data-site="ampproject.org"
      data-responsive="true">
  </amp-ad>
```

## Configuration

__Required:__

`data-name` - The name of the ad unit.

`data-site` - The site/domain this ad will be served on (effectively an account id)

`width` + `height` - Required for all `<amp-ad>` units. Specifies the ad size.

`type` - always set to "sortable"

__Optional:__

`data-reponsive` - when set to true indicates that the ad slot has multiple potential sizes.
 

No explicit configuration is needed for a given sortable amp-ad, though each site must be set up beforehand with [Sortable](http://sortable.com). The site name `ampproject.org` can be used for testing. Note that only the two examples above will show an ad properly.
