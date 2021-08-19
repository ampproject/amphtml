# Yektanet

## Example

### Native Ads

```html
<amp-ad
  width="400"
  height="400"
  type="yektanet"
  data-publisher-name="yektanet.com"
  data-script-name="yektanet-article.js"
  data-pos-id="pos-article-display-1"
>
</amp-ad>
```

### Banners

```html
<amp-ad width="300" height="250"
    type="yektanet"
    data-ad-type="banner"
    data-publisher-name="yektanet-bnr"
    data-script-name="uid.js"
    data-pos-id="ynpos-1">
</amp-ad>
```

### Sticky Banners

```html
<amp-sticky-ad layout="nodisplay">
  <amp-ad width="468" height="60"
      type="yektanet"
      data-ad-type="banner"
      data-publisher-name="yektanet-bnr"
      data-script-name="uid.js"
      data-pos-id="ynpos-8845">
  </amp-ad>
</amp-sticky-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

Supported parameters:

-   `data-ad-type`
-   `data-publisher-name`
-   `data-script-name`
-   `data-pos-id`
