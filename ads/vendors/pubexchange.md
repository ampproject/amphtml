# PubExchange

## Example

### Basic

```html
<amp-embed
  width="640"
  height="320"
  heights="(max-width:480px) 400%, (max-width:650px) 100%, 75%"
  layout="responsive"
  type="pubexchange"
  data-publication="test_publication"
  data-module-id="below_content"
  data-module-num="2626"
  data-test="true"
>
</amp-embed>
```

## Configuration

For semantics of configuration, please see [PubExchange's documentation](https://www.pubexchange.com/dashboard/developer/update_modules).

### Required parameters

-   `data-publication`: Shortcode identifying publication provided by PubExchange account manager
-   `data-module-id`: Shortcode identifying module provided by PubExchange account manager
-   `data-module-num`: ID identifying module provided by PubExchange account manager

### Optional parameters

-   `data-test`: Pass the parameter with the "true" value to test the PubExchange module
