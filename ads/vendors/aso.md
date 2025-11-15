# Adserver.Online

## Example

### Basic

```html
  <amp-ad
    type="aso"
    width="300"
    height="250"
    data-zone="158819">
  </amp-ad>
```

### Sticky Ad

```html
<amp-sticky-ad layout="nodisplay">
  <amp-ad
    type="aso"
    width="320"
    height="100"
    data-zone="158829">
  </amp-ad>
</amp-sticky-ad>
```

Note that `<amp-sticky-ad />` component requires the following script to be included in the page:

```html
<script
    async
    custom-element="amp-sticky-ad"
    src="https://cdn.ampproject.org/v0/amp-sticky-ad-1.0.js"
></script>
```

## Configuration

For details on the configuration, please see [Adserver Documentation](https://adserver.online/article/amp).

### Required parameters

-   `data-zone`

### Optional parameters

-   `data-host` - custom media domain
-   `data-attr` - custom attributes, JSON-string. Example: `data-attr='{"foo": "bar"}'`
