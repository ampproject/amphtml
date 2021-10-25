# F1H

## Examples

### Single ad

```html
<amp-ad
  width="728"
  height="90"
  type="f1h"
  data-section-id="100"
  data-slot="107"
>
</amp-ad>
```

### Using custom params and custom ad server url

```html
<amp-ad
  width="728"
  height="90"
  type="f1h"
  data-section-id="100"
  data-slot="107"
  data-custom='{"my_custom_param":"my_custom_value"}'
  data-pubnetwork-lib="adlib_file_url"
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

-   `sectionId`: ID of this section in inventory system.
-   `slot`: ID of slot that will be showed in this ad block.
-   `pubnetwork-lib`: Filepath of ad library.

### Optional parameters

-   `custom`: usage example

```text
{
    "arrayKey":["value1",1],
    "stringKey":"stringValue"
}
```
