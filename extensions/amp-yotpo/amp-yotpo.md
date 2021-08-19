---
$category@: media
formats:
  - websites
teaser:
  text: Embeds a Yotpo on-site widget.
---

# amp-yotpo

## Overview

You can use the `amp-yotpo` extension to display [Yotpo on-site widgets](https://support.yotpo.com/en/on-site/reviews-widget).

_Example: Display the Yotpo bottom line widget_

```html
<amp-yotpo
  width="550"
  height="100"
  data-app-key="liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5"
  data-widget-type="BottomLine"
  data-product-id="9408616206"
>
</amp-yotpo>
```

_Example: Display the reviews widget_

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
  data-yotpo-element-id="1"
>
</amp-yotpo>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-app-key (required)</strong></td>
    <td>Specifies the account app key. For example, <code>liSBkl621ZZsb88tsckAs6Bzx6jQeTJTv8CDf8y5</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-** (optional)</strong></td>
    <td>Each Yotpo widget has optional data attributes. For example, the reviews widget has an optional attribute named <code>product-id</code>. Refer to <a href="https://support.yotpo.com/en/on-site">Yottpo's documentation</a> for which attributes to specify.<br>
When using the <code>amp-yotpo</code> extension, for each corresponding Yotpo attribute prepend <code>data</code> to the attribute. For example, the <code>product-id</code> attribute becomes <code>data-product-id</code>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (optional)</strong></td>
    <td>Define a <code>title</code> attribute for the component. The default is <code>Yotpo widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-yotpo rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-yotpo/validator-amp-yotpo.protoascii) in the AMP validator specification.
