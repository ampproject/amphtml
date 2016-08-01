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

# Doubleclick

## Example

### Basic

```html
<amp-ad width=320 height=50
    type="doubleclick"
    data-slot="/4119129/mobile_ad_banner">
</amp-ad>
```

### With additional targeting

```html
<amp-ad width=320 height=50
    type="doubleclick"
    data-slot="/4119129/mobile_ad_banner"
    json='{"targeting":{"sport":["rugby","cricket"]},"categoryExclusions":["health"],"tagForChildDirectedTreatment":1}'>
</amp-ad>
```

## Configuration

For semantics of configuration, please see [ad network documentation](https://developers.google.com/doubleclick-gpt/reference).


### Ad size

By default the ad size is based on the `width` and `height` attributes of the `amp-ad` tag. In order to explicitly request different ad dimensions from those values, pass the attributes `data-override-width` and `data-override-height` to the ad.

Example:

```html
<amp-ad width=320 height=50
    data-override-width=111
    data-override-height=222
    type="doubleclick"
    data-slot="/4119129/mobile_ad_banner">
</amp-ad>
```

### Supported parameters

- `data-slot`

Supported via `json` attribute:

- `categoryExclusions`
- `cookieOptions`
- `tagForChildDirectedTreatment`
- `targeting`
- `useSameDomainRenderingUntilDeprecated`

### Temporary use of useSameDomainRenderingUntilDeprecated
An experiment to use the higher performance GPT Light tag in place of the DoubleClick GPT tag causes the ad to render in a second cross domain iframe within the outer AMP iframe. This prevents ads from accessing the iframe sandbox information and methods which are provided by the AMP runtime. Until this API is available to work in the second level iframe, publishers can opt out of this experiment by including "useSameDomainRenderingUntilDeprecated": 1 as a json attribute. This attribute will be deprecated by the end of August 2016, when the GPT Light tag will become the default, and all ads will always be rendered inside a second cross domain iframe

Example:
```html
<amp-ad width=320 height=50
    type="doubleclick"
    data-slot="/4119129/mobile_ad_banner"
    json='{"useSameDomainRenderingUntilDeprecated":1}'>
</amp-ad>
```


### Unsupported DFP Features & Formats

#### Unsupported Features:
- Multisize requests. Since the size of the adslot needs to be defined prior to the ad request, multisize requests are not supported.
- Guaranteed Roadblocks. Non-guaranteed roadblocks (As many as possible, One or More) delivery is supported

#### Unsupported Formats/Creatives:
- Interstitials
- Expandables. Although expandables on interaction/click is a format that is work in progress.
- Flash
- Anchor Ads / Adhesion Units
- Creatives served over HTTP.

### DFP Implementation Examples
[This](http://dfp-amp-testing-1185.appspot.com/) website has a list of implementation examples with source code that showcase DFP features.



