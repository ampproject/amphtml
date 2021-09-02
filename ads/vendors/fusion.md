# Fusion

## Example

```html
<amp-ad
  width="600"
  height="100"
  type="fusion"
  data-ad-server="bn-01d.adtomafusion.com"
  data-media-zone="adtomatest.apica"
  data-layout="apicaping"
  data-space="apicaAd"
  data-parameters="age=99&isMobile&gender=male"
>
</amp-ad>
```

## Configuration

For configuration and implementation details, please contact the Fusion support team: support@adtoma.com

Supported parameters:

-   `data-ad-server`
-   `data-media-zone`
-   `data-layout`
-   `data-space`
-   `data-parameters`

Parameters should be passed as `key&value` pairs `&` separated. Missing value equals `true`. So `...&isMobile&...` from the example above stands for `...&isMobile=true&...`.
