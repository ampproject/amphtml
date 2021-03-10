---
$category@: presentation
formats:
  - websites
teaser:
  text: Displays an overflow for amp-ads and amp-iframes with a customizable button.
---

<!--
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# amp-overflow-button

## Usage

This is an overflow wrapper for amp-ad and amp-iframe.  It covers the ad or iframe with a semi-transparent overlay
and displays a Button with a CTA to encourage user interaction.  The color and text of the button are customizable.  

[filter formats=“websites”]

### Default Example

[example preview="inline" playground="true" imports="amp-ad, amp-overflow-button"]

```html
<amp-ad height="150" type="myfinance" data-ad-type="widget" data-test="true">
  <amp-overflow-button overflow> </amp-overflow-button>
</amp-ad>
```

![alt_text](images/default_color_cta.png 'image_tooltip')

### Custom Color and CTA Text Example

[example preview="inline" playground="true" imports="amp-ad, amp-overflow-button"]

```html
<amp-ad height="150" type="myfinance" data-ad-type="widget" data-test="true">
  <amp-overflow-button overflow color="#B80000" cta="Show more"> </amp-overflow-button>
</amp-ad>
```

![alt_text](images/custom_color_cta.png 'image_tooltip')

## Attributes

<table>
  <tr>
    <td width="40%"><strong>cta (optional)</strong></td>
    <td>Overrides the default CTA text of the Button</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (optional)</strong></td>
    <td>Overrides the default Color of the CTA Text and Button Border</td>
  </tr>
</table>

## Validation

See [amp-overflow-button rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-overflow-button/validator-amp-overflow-button.protoascii) in the AMP validator specification.
