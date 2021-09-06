# Purch

## Example

```html
<amp-ad
  width="300"
  height="250"
  type="purch"
  data-pid="2882"
  data-divid="rightcol_top"
  data-config='{"targeting":{"key1":"value1", "key2":"value2"}}'
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

Supported parameters:

-   `data-pid`: placement id
-   `data-divid`: div id of unit
-   `data-config`: Optinal parameter to control the ad behaviour.
-   `data-config.targeting`: Optinal config parameter to pass key-values to DFP/GAM.
