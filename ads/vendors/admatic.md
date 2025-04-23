# AdMatic

## Example of AdMatic's model implementation

### Basic

```html
  <amp-ad
    type="admatic"
    width="300"
    height="250"
    data-ad-type-id="standard"
    data-ad-network="adm-pub-194162670389"
    data-ad-publisher="65943e194d11b285b6173588">
  </amp-ad>
```

### Sticky Ad

```html
<amp-sticky-ad layout="nodisplay">
  <amp-ad
    type="admatic"
    width="320"
    height="100"
    data-ad-type-id="standard"
    data-ad-network="adm-pub-194162670389"
    data-ad-publisher="65943e194d11b285b6173588">
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

For details on the configuration semantics, see [AdMatic documentation](https://www.admatic.com.tr/).

### Required parameters

-   `data-ad-network`: Network ID
-   `data-ad-publisher`: Publisher ID
-   `data-ad-type-id`: Model ID
