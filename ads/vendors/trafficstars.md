# TrafficStars

Serves ads from the [TrafficStars](https://www.trafficstars.com/).

## Example

```html
<amp-embed
  width="640"
  height="320"
  type="trafficstars"
  data-spot="{string}"
  data-upload-link="{string}"
  data-queries-params="{string[]}"
  data-native-settings="{Object}"
  data-wrapper-styles="{ElementCSSInlineStyle}"
  data-iframe-styles="{ElementCSSInlineStyle}"
  data-on-load-response-hook="{(data: TMasterSpotData) => void}"
  data-on-spot-rendered-hook="{(element: HTMLElement) => void}"
  data-on-load-error-hook="{() => void}"
  data-subid="{string}"
  data-subid_1="{string}"
  data-subid_2="{string}"
  data-subid_3="{string}"
  data-subid_4="{string}"
  data-subid_5="{string}"
>
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

-   `data-spot` - code spot

### Optional parameters

-   `uploadLink` - link for ad request
-   `queriesParams` - params for ad request
-   `nativeSettings` - settings for native ad
-   `wrapperStyles` - styles for native ad
-   `iFrameStyles` - styles for banner ad
-   `onLoadResponseHook` - hook after ad request success
-   `onSpotRenderedHook` - hook after ad render success
-   `onLoadErrorHook` - hook after ad request error
-   `subid` - attribute of data
-   `subid_1` - attribute of data
-   `subid_2` - attribute of data
-   `subid_3` - attribute of data
-   `subid_4` - attribute of data
-   `subid_5` - attribute of data
