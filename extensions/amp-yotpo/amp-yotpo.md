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
    <td>Display Yotpo's widgets.</td>
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

## Examples

  ```html
  <amp-yotpo
          width="550"
          height="100"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="BottomLine"
          data-product-id="9408616206">
  </amp-yotpo>
  ```
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
  ```html
  <amp-yotpo
          width="200"
          height="200"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="Badge">
  </amp-yotpo>
  ```
  ```html
  <amp-yotpo
          layout="responsive"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="ReviewsTab">
  </amp-yotpo>
  ```
  ```html
  <amp-yotpo
          width="1280"
          height="200"
          layout="responsive"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="ProductGallery"
          data-product-id="nb2b_picture_slider_1"
          data-demo="true"
          data-layout-rows="3"
          data-layout-scroll="1"
          data-spacing="0"
          data-source="all"
          data-title="0"
          data-hover-color="#ffffff"
          data-hover-opacity="0.8"
          data-hover-icon="true"
          data-upload-button="0"
          data-preview="true"
          data-yotpo-element-id="1">
  </amp-yotpo>
  ```
  ```html
  <amp-yotpo
          width="1280"
          height="300"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="EmbeddedWidget"
          data-product-id="top_rated_products"
          data-demo="true"
          data-width="100"
          data-layout="basic"
          data-reviews="5"
          data-header-text="Top Rated Products"
          data-header-background-color="919191"
          data-body-background-color="FFFFFF"
          data-font-size="18"
          data-font-color="FFFFFF"
          data-yotpo-element-id="1">
  </amp-yotpo>
  ```
  ```html
  <amp-yotpo
          width="550"
          height="200"
          layout="responsive"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="PhotosCarousel"
          data-product-id="nb2b_picture_slider_1"
          data-demo="true">
  </amp-yotpo>
  ```
  ```html
  <amp-yotpo
          width="550"
          height="200"
          layout="responsive"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="PromotedProducts"
          data-product-id="9408616206"
          data-demo="true">
  </amp-yotpo>
  ```
  ```html
  <amp-yotpo
          width="550"
          height="200"
          layout="responsive"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="VisualUgcGallery">
  </amp-yotpo>
  ```
  ```html
  <amp-yotpo
          width="550"
          height="200"
          layout="responsive"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="ReviewsCarousel"
          data-backgroud-color="transparent"
          data-mode="manual"
          data-review-ids="354,356,355"
          data-show-bottom-line="1"
          data-autoplay-enabled="1"
          data-autoplay-speed="3000"
          data-show-navigation="1"
          data-yotpo-element-id="3">
  </amp-yotpo>
  ```
  ```html
  <amp-yotpo
          width="550"
          height="300"
          layout="responsive"
          data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
          data-widget-type="PicturesGallery"
          data-layout="full_page"
          data-layout-scroll="1"
          data-spacing="0"
          data-source="all"
          data-title="0"
          data-hover-color="#ffffff"
          data-hover-opacity="0.8"
          data-hover-icon="true"
          data-cta-text="Shop Now"
          data-cta-color="Shop Now">
  </amp-yotpo>
  ```
