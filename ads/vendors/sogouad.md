# Sogou

## Examples

```html
<!-- Responsive Ad -->
<amp-ad
  width="20"
  height="3"
  type="sogouad"
  layout="responsive"
  data-slot="854370"
  data-w="20"
  data-h="3"
>
</amp-ad>

<!-- Fixed-height Ad -->
<amp-ad
  height="69"
  type="sogouad"
  layout="fixed-height"
  data-slot="854366"
  data-w="100%"
  data-h="69"
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

Responsive mode:

-   `data-slot`: slot id of Sogou ads
-   `data-w`: always be 20
-   `data-h`: slot's height info from Sogou ads

Fixed-height mode:

-   `data-slot`: slot id of Sogou ads
-   `data-w`: always be 100%
-   `data-h` slot's height info from Sogou ads
