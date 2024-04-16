# Swoop

## Example

```html
<amp-ad
  width="auto"
  height="125"
  type="swoop"
  layout="fixed-height"
  data-layout="fixed-height"
  data-publisher="SW-11122234-1AMP"
  data-placement="page/content"
  data-slot="article/body"
>
  <div placeholder></div>
  <div fallback></div>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

-   `layout`: AMP layout style, should match the `layout` attribute of the `amp-ad` tag
-   `publisher`: Publisher ID
-   `placement`: Placement type
-   `slot`: Slot ID
