# AdinCube

Visit [dashboard.adincube.com](https://dashboard.adincube.com/dashboard) to create a publisher account and get access to our AMP ads.

## Examples

### In content

Uses fixed size by the given `width` and `height`.

```html
<amp-ad
  width="300"
  height="250"
  type="adincube"
  data-ad-type="in_content"
  data-site-key="TEST_WEBSITE_KEY"
>
</amp-ad>
```

### Sticky banner

Uses fixed size by the given `width` and `height`.

```html
<amp-sticky-ad layout="nodisplay">
  <amp-ad
    width="320"
    height="50"
    type="adincube"
    data-ad-type="sticky_banner"
    data-site-key="TEST_WEBSITE_KEY"
  >
  </amp-ad>
</amp-sticky-ad>
```

Refer to the [amp-sticky-ad](https://amp.dev/documentation/components/amp-sticky-ad) documentation to see how to implement this ad.

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

-   `data-ad-type` - type of the ad
-   `data-site-key` - unique key attached to a website

### Optional parameters

-   `data-params` - additional config parameters
