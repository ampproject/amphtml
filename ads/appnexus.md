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

# AppNexus

## Examples

### Basic single ad - tagid

```html
<amp-ad width="300" height="250"
    type="appnexus"
    data-tagid="6063968">
</amp-ad>
```

### Basic single ad - member and code

```html
<amp-ad width="300" height="250"
    type="appnexus"
    data-member="958"
   data-code="inv_code_test">
</amp-ad>
```

### AST single ad call with keywords

Note: you should use either the basic setup or AST setup. Do not mix types on the same page.

```html
<amp-ad width="320" height="50"
    type="appnexus"
    data-target="apn_ad_40954389058"
    json='{"pageOpts": {"member": 958,"invCode": "ast_guaranteed_prios_1","keywords": {"adSite":"mobile-smh","cat":"business","cat1":"bankingandfinance","ctype":"article","synd":"amp"}},"targetId": "apn_ad_40954389058","sizes": [[300, 50]],"adUnits": [{"invCode": "ast_guaranteed_prios_1","disablePsa": true,"sizes": [[320, 50],[300, 50]],"targetId": "apn_ad_5675675648","keywords": {"pos": 1}},{"invCode": "ast_guaranteed_prios_1","disablePsa": true,"sizes": [30, 250],"targetId": "apn_ad_5675675648","keywords": {"pos": 2}}]}'class="i-amphtml-element i-amphtml-layout-fixed i-amphtml-layout-size-defined i-amphtml-layout">
</amp-ad>
```

### AST for multiple sync ads on the page

```html
<amp-ad width="300" height="250"
    type="appnexus"
    data-target="apn_ad_40954389058"
    json='{"pageOpts": {"member": 958},"adUnits": [{"disablePsa": true,"invCode": "ast_guaranteed_prios_1","tagId": 12345,"sizes": [300, 250],"targetId": "apn_ad_40954389058"}, {"invCode": "ast_guaranteed_prios_1","tagId": 456,"sizes": [160, 600],"targetId": "apn_ad_5675675648"}]}'>
</amp-ad>

<amp-ad width="160" height="600"
    type="appnexus"
    data-target="apn_ad_5675675648"
    json='{"pageOpts": {"member": 958},"adUnits": [{"disablePsa": true,"invCode": "ast_guaranteed_prios_1","tagId": 12345,"sizes": [300, 250],"targetId": "apn_ad_40954389058"}, {"invCode": "ast_guaranteed_prios_1","tagId": 456,"sizes": [160, 600],"targetId": "apn_ad_5675675648"}]}'>
</amp-ad>
```

## Configuration

See AppNexus [Tiny Tag documentation](https://wiki.appnexus.com/display/adnexusdocumentation/Dynamic+TinyTag+Parameters) or [AST  documentation](https://wiki.appnexus.com/pages/viewpage.action?pageId=75793258) for details on input parameters.

### Enable debugging

To enable debugging with the AST type of tags, just set `data-debug=true` in all your amp-ad tags.

```html
<amp-ad width="300" height="250"
    type="appnexus"
    data-target="apn_ad_40954389058"
    data-debug=true
    json='{"pageOpts":{"member": 958}, "adUnits": [{"disablePsa": true, "invCode": "ast_guaranteed_prios_1","sizes": [300,250],"targetId": "apn_ad_40954389058"}, {"invCode": "ast_guaranteed_prios_1","sizes": [160,600],"targetId":"apn_ad_5675675648"}]}'>
</amp-ad>

<amp-ad width="160" height="600"
    type="appnexus"
    data-target="apn_ad_5675675648"
    data-debug=true
    json='{"pageOpts":{"member": 958}, "adUnits": [{"disablePsa": true, "invCode": "ast_guaranteed_prios_1","sizes": [300,250],"targetId": "apn_ad_40954389058"}, {"invCode": "ast_guaranteed_prios_1","sizes": [160,600],"targetId":"apn_ad_5675675648"}]}'>
</amp-ad>
```
