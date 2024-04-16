# RUNative

Serves ads from the [RUNative](https://www.runative.com/).

## Example

```html
<amp-embed
  width="640"
  height="320"
  layout="responsive"
  type="runative"
  data-spot="{spotcode}"
  data-ad-type="{ad type}label-over"
  data-cols="{number cols}"
  data-rows="{number rows}"
  data-title="{title of ad}"
  data-keywords="{keywords}"
>
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

-   `data-spot` - code spot

### Optional parameters

-   `data-ad-type` - types of ads: `img-left`, `img-right`, `label-over`, `label-under`
-   `data-keywords` - title of ad
-   `data-title` - title of ad
-   `data-cols` - number of cols 1 till 6
-   `data-rows` - number of rows 1 till 6
-   `data-title-position` - position of ad title (`left` or `right`)
-   `data-ads-by-position` - position of runative logo (`left` or `right`)
