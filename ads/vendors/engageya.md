# Engageya

## Example of Engageya's widget implementation

### Basic

```html
<amp-embed
  width="200"
  height="200"
  type="engageya"
  layout="responsive"
  data-widgetIds="WID_1,WID_2"
  data-websiteId="WEBID_1"
  data-publisherId="PUBID_1"
>
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

-   `data-widgetIds`: Widget ids
-   `data-websiteId`: Website Id
-   `data-publisherId`: Publisher Id

### Optional parameters

-   `data-url`: Current none amp version URL
-   `data-ampUrl`: Current AMP page URL
-   `data-styleCSS`: Additional style
