# Yobee

## Example of Yobee's model implementation

### Basic

```html
  <amp-ad
    type="yobee"
    width="300"
    height="250"
    data-ad-type-id="standard"
    data-ad-network="ybe-pub-7859401243"
    data-ad-publisher="677fa0cdfee472c84b643ca7">
  </amp-ad>
```

### Sticky Ad

```html
<amp-sticky-ad layout="nodisplay">
  <amp-ad
    type="yobee"
    width="320"
    height="100"
    data-ad-type-id="standard"
    data-ad-network="ybe-pub-7859401243"
    data-ad-publisher="677fa0cdfee472c84b643ca7">
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

For details on the configuration semantics, see [Yobee documentation](https://developer.yobee.it/).

### Required parameters

-   `data-ad-network`: Network ID
-   `data-ad-publisher`: Publisher ID
-   `data-ad-type-id`: Model ID
