<!---
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

# MyFinance

Serves ads from [MyFinance](https://www.myfinance.com/).

## Example

### Widgets

#### Dynamic based on page content

```html
<amp-ad
  type="myfinance"
  data-selector="myfi-content-end"
  data-type="widget"
>
</amp-ad>
```

#### Static from a Creative Set

```html
<amp-ad
  type="myfinance"
  data-creative-set="27cdb25b-5df4-4aca-8ef2-f63fd874e1f1"
  data-type="widget"
>
</amp-ad>
```

#### Static Widget

```html
<amp-ad
  type="myfinance"
  data-widget="0aec0151-4fa2-47cc-abfc-13d4f9861b7a"
  data-type="widget"
>
</amp-ad>
```

### CRU

```html
<amp-ad
  type="myfinance"
  data-campaign="test-campaign"
  data-type="cru"
>
</amp-ad>
```

## Configuration

### Widgets

#### Required parameters

-   `data-type` - set to `widget`

#### Widgets require one of the following parameters to be set

-   `data-selector` - corresponds to the div id on the canonical page that has dynamic ads configured
-   `data-creative-set` - the id of the creative set to pull ads from
-   `data-widget` - the id of the widget to serve

#### Optional parameters

-   `data-sub-id` - pass through for a partner sub id

### Content Recommendation Unit

#### Required parameters

-   `data-type` - set to `cru`
-   `data-campaign` - set to a valid campaign

#### Optional parameters

-   `data-selector` - corresponds to the div id on the canonical page that has a pre-rendered cru configured
