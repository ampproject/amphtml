# Sortable

## Examples

```html
<amp-ad
  width="728"
  height="90"
  type="sortable"
  data-name="728x90_amp"
  data-site="ampproject.org"
>
</amp-ad>

<amp-ad
  width="300"
  height="250"
  type="sortable"
  data-name="medrec"
  data-site="ampproject.org"
>
</amp-ad>

<!-- Responsive Ad -->
<amp-ad
  width="300"
  height="250"
  type="sortable"
  data-name="medrec"
  data-site="ampproject.org"
  data-responsive="true"
>
</amp-ad>
```

## Configuration

No explicit configuration is needed for a given sortable amp-ad, though each site must be set up beforehand with [Sortable](http://sortable.com). The site name `ampproject.org` can be used for testing. Note that only the two examples above will show an ad properly.

### Required parameters

-   `data-name`: The name of the ad unit.
-   `data-site`: The site/domain this ad will be served on (effectively an account id)
-   `width` + `height`: Required for all `<amp-ad>` units. Specifies the ad size.
-   `type`: Always set to "sortable"

### Optional parameters

-   `data-reponsive`: When set to true indicates that the ad slot has multiple potential sizes.
