# Adverline

## Examples

### Single ad

```html
<amp-ad
  width="300"
  height="250"
  type="adverline"
  data-id="your_publisher_id"
  data-plc="your_plc"
  data-section="your,test,sections"
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

-   `data-id`: site ID
-   `data-plc`: format ID (unique per page)

### Optional parameters

-   `data-section`: tag list, separated by commas
-   `data-s`: dynamic sizing, allowed values: fixed, all, small (default), big
