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
```
### A/B testing
```html
  <amp-ad width="300" height="250"
      type="sortable"
      data-name="medrec"
      data-site="ampproject.org"
      data-ab-type="doubleclick"
      data-ab-pct="50"
      data-slot="/4119129/mobile_ad_banner">
  </amp-ad>

  <amp-ad width="300" height="250"
      type="sortable"
      data-name="medrec"
      data-site="ampproject.org"
      data-ab-type="adsense"
      data-ab-pct="50"
      data-ad-client="ca-pub-2005682797531342"
      data-ad-slot="7046626912">
  </amp-ad>
```

## Configuration

__Required:__

`data-name` - The name of the ad unit.

`data-site` - The site/domain this ad will be served on (effectively an account id)

`width` + `height` - Required for all `<amp-ad>` units. Specifies the ad size.

`type` - always set to "sortable"
 
__Optional:__

`data-ab-type` - for A/B testing Sortable against other services. Either 'adsense' or 'doubleclick'.
`data-ab-pct` - percent likelihood that the alternate tags will be run instead of Sortable's.

No explicit configuration is needed for a given sortable amp-ad, though each site must be set up beforehand with [Sortable](http://sortable.com). The site name `ampproject.org` can be used for testing. Note that only the two examples above will show an ad properly.
for A/B testing, ad slots must have attributes compliant with the services that are being tested against Sortable. See the examples above.
