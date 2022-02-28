# Criteo

Criteo support for AMP covers Passback technologies.

There is also support for CDB via RTC integrations.

For configuration details and to generate your tags, please refer to [your publisher account](https://publishers.criteo.com) or contact publishers@criteo.com.

## Example - Passback

```html
<amp-ad
  width="320"
  height="50"
  type="4wmarketplace"
  data-id="76473;98469;199717;0"
  data-dim="{'width':'320px', 'height':'50px'}"
>
</amp-ad>
```

## Configuration

The ad size is based on the setup of your Criteo zone. The `width` and `height` attributes of the `amp-ad` tag should match that.

### Passback

Supported parameters:

-   `data-tagtype`: identifies the used Criteo technology. Must be "passback". Required.
-   `data-zone`: your Criteo zone identifier. Required.
