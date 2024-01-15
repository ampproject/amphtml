# Pixad

## Example of Pixad's model implementation

### Basic

```html
  <amp-ad
    type="pixad"
    width="300"
    height="250"
    data-ad-type-id="standard"
    data-ad-network="px-pub-6514176248"
    data-ad-publisher="654b7d501cd4137ca98e020d">
  </amp-ad>
```

### Sticky Ad

```html
<amp-sticky-ad layout="nodisplay">
  <amp-ad
    type="pixad"
    width="320"
    height="100"
    data-ad-type-id="778130932"
    data-ad-network="px-pub-6514176248"
    data-ad-publisher="654b7d501cd4137ca98e020d">
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

For details on the configuration semantics, see [Pixad documentation](https://developer.pixad.com.tr/).

### Required parameters

-   `data-ad-network`: Network ID
-   `data-ad-publisher`: Publisher ID
-   `data-ad-type-id`: Model ID
