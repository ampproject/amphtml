# JIXIE

## Example of JIXIE AD implementation

```html
<amp-ad
  width="300"
  height="250"
  type="jixie"
  layout="responsive"
  data-unit="ADUNIT_CODE"
  data-cid="800"
  data-options='{"miscParams":{"reserve1":"test1","reserve2":"test2"}}'
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact JIXIE

### Required parameters

-   `data-unit`: ADUNIT_CODE (given by jixie to the publisher)

### Optional parameters

-   `data-cid`: specific creative id
-   `data-options`: stringified json object with miscellaenous info
