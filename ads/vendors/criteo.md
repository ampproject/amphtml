# Criteo

Criteo support for AMP covers Passback technologies.

There is also support for CDB via RTC integrations.

For configuration details and to generate your tags, please refer to [your publisher account](https://publishers.criteo.com) or contact publishers@criteo.com.

## Example - Passback

```html
<amp-ad
  width="300"
  height="250"
  type="criteo"
  data-tagtype="passback"
  data-zone="567890"
>
</amp-ad>
```

## Configuration

The ad size is based on the setup of your Criteo zone. The `width` and `height` attributes of the `amp-ad` tag should match that.

### Passback

Supported parameters:

-   `data-tagtype`: identifies the used Criteo technology. Must be "passback". Required.
-   `data-zone`: your Criteo zone identifier. Required.
