# AdTech

## Example

```html
<amp-ad
  width="300"
  height="250"
  type="adtech"
  data-atwMN="2842475"
  data-atwDiv="adtech-ad-container"
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters:

-   `data-atwMN` - magic number for the ad spot
-   `data-atwDiv` - div name of the ad spot; can be class or id

### Optional parameters:

-   `data-atwPlId` - placement ID (instead of Magic Number)
-   `data-atwOthAT` - generic var to set key/value pairs to send with the ad call; accepts multiple values in a semi-colon delimited list
-   `data-atwCo` - override default country code
-   `data-atwHtNmAT` - override ad host name
-   `data-atwNetId` - network ID
-   `data-atwWidth` - ad width (use with atwHeight only if the ad is not 300x250)
-   `data-atwHeight`- ad height (use with atwWidth only if the ad is not 300x250)
-   `data-atwSizes` - this overrides atwWidth/atwHeight; use this to create a comma-separated list of possible ad sizes
-   'data-atwPolar' - set to "1" to enable Polar.me ad in the ad spot

### Direct URL call:

-   `src` - Value must start with `https:` and contain `/addyn/`. This should only be used in cases where a direct ad call is being used rather than a magic number (MN).
