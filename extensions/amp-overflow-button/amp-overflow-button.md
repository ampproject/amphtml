---
$category@: presentation
formats:
  - websites
teaser:
  text: Displays an overflow with a customizable button for amp-ads and amp-iframes.
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

This is an overflow wrapper for amp-ad and amp-iframe. It covers the ad or iframe with a semi-transparent overlay and displays a Button with a CTA to encourage user interaction. The color and text of the button are customizable.
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

## Styling

The `<amp-overflow-button>` component allows stying of the button through the `amp-overflow-button-cta-button` css class. The rest of the component features a semi-transparent background.

[example playground="true" preview="top-frame" orientation="landscape"]

```css
.amp-overflow-button-cta-button {
  background-color: transparent;
  border-width: 2px;
  border-style: solid;
  border-radius: 5px;
  border-color: #0058FF;
  color: #0058FF;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 1px;
  padding: 10px 35px;
  font-family: 'Circular Std', 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}
```

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
