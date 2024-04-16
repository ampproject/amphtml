# recomAD widget

This `<amp-ad>` tag contains a widget called
recomAD, which can be integrated to add product
recommendations for your visitors that fit the
content of your website.

See [https://recomad.de](https://recomad.de) for details.

## Example

```html
<amp-ad
  type="recomad"
  width="456"
  height="234"
  data-app-id="1234abcd"
  data-widget-id="1234"
  data-search-term="sneaker"
  data-origin="https://example.com/articles/my-article-about-sneaker"
  data-puid="YOUR_TRACKING_ID_FOR_YOUR_USER"
></amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the [ad network](#configuration) or refer to their [documentation](#ping).

### Required parameters

-   `data-app-id` : Your app id
-   `data-widget-id` : Your widget id

Please contact us at cooperations@s24.com to receive an `app id` and a `widget id`.

### Required _at least one of these two_ parameters

-   `data-search-term` : Required if _recomAD Search_. The search term you would like to get products for
-   `data-origin` : Required if _recomAD Semantic_. Your canonical link of your original page

### Optional parameters

-   `data-puid` : Your tracking id for the end user
