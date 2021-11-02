# Imonomy

Imonomy supports Header Tag style bidding using Doubleclick as the ad server.

## Example

```html
<amp-ad
  width="728"
  height="90"
  type="imonomy"
  data-pid="5656544455"
  data-sub-id="636gd"
  data-slot="/36653869/amp_imo_multi_size"
>
</amp-ad>
```

## Configuration

For semantics of configuration, please contact your account manager at Imonomy.

If you use `remote.html` in your AMP pages, you must add `imonomy` into the array that outlines the list of acceptable types. For example, `['doubleclick']` should be changed to `['doubleclick', 'imonomy']`. If you do not use `remote.html`, this step is not required.

Ad size is based on the `width` and `height` attributes of the `amp-ad` tag by default. Both width and height override attributes (`data-override-width` and `data-override-height`) and multi-size ads (via `data-multi-size`) are supported.

### Required parameters

-   `data-pid`
-   `data-sub-id`
-   `data-slot`

Additional parameters including `json` will be passed through in the resulting call to DFP. For details please see the [Doubleclick documentation](https://github.com/ampproject/amphtml/blob/main/ads/google/doubleclick.md).
