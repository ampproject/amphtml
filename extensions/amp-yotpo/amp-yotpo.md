<!--
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# <a name="`amp-yotpo`"></a> `amp-yotpo`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>
    Display Yotpo's widgets.<br /> 
    Can be any on site widget taken from <a href="https://support.yotpo.com/en/on-site/reviews-widget">Yotpo's site</a>.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-yotpo" src="https://cdn.ampproject.org/v0/amp-yotpo-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Overview

You can use the `amp-yotpo` extension in order to display<a href="https://support.yotpo.com/en/on-site/reviews-widget">on site widgets</a>.

For example, in order to display yotpo's bottom line widget use the following code: 
```html
  <amp-yotpo
          width="550"
          height="100"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="BottomLine"
          data-product-id="9408616206">
  </amp-yotpo>
```

  
In order to display the reviews widgets use this code:
```html
  <amp-yotpo
          width="550"
          height="700"
          layout="responsive"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="MainWidget"
          data-product-id="9408616206"
          data-name="hockey skates"
          data-url="https://ranabram.myshopify.com/products/hockey-skates"
          data-image-url="https://ichef.bbci.co.uk/news/320/media/images/83351000/jpg/_83351965_explorer273lincolnshirewoldssouthpicturebynicholassilkstone.jpg"
          data-descriptipn="skates"
          data-yotpo-element-id="1">
  </amp-yotpo>
```

## Attributes

##### data-app-key (required)

The account app key. For example, `liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5`.

##### data-widget-type (required)

The widget type. For example, `MainWidget`, `BottomLine`, etc..

##### other yotpo's markups (optional)

For each widget there are optional data attributes. 

For example, the reviews widget has an optional markup named `product-id`. In amp extension

each yotpo's markup being added to the `data` attribute. So in that case the `product-id` markup

will be `data-product-id`.

You could see yotpo's markups under [yotpo's site](https://support.yotpo.com/en/on-site). 


## Validation

See [amp-yotpo rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-yotpo/validator-amp-yotpo.protoascii) in the AMP validator specification.
