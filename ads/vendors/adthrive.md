# AdThrive

Your site must be approved and active with [AdThrive](http://www.adthrive.com) prior to use. AdThrive will install or provide specific tags for your site.

## Examples

### Render an ad with the default sizes

```html
<amp-ad
  width="320"
  height="50"
  type="adthrive"
  data-site-id="test"
  data-ad-unit="AdThrive_Content_1"
>
</amp-ad>
```

### Render an ad with a fixed size 320x50

```html
<amp-ad
  width="320"
  height="50"
  type="adthrive"
  data-site-id="test"
  data-ad-unit="AdThrive_Content_1"
  data-sizes="320x50"
>
</amp-ad>
```

### Render an ad with multiple sizes (320x50,320x100,300x250)

```html
<amp-ad
  width="320"
  height="50"
  type="adthrive"
  data-site-id="test"
  data-ad-unit="AdThrive_Content_1"
  data-sizes="320x50,320x100,300x250"
>
</amp-ad>
```

## Configuration

### Required parameters

-   `data-site-id` - Your AdThrive site id.
-   `data-ad-unit` - AdThrive provided ad unit.

### Optional parameters

`data-sizes` - Comma separated list of ad sizes this ad slot should support. The iFrame will be resized if allowed.
