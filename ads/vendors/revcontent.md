# Revcontent

## Examples

### Standard Tag

The standard AMP tag for Revcontent is the basic AMP ads integration and is used as shown here:

```html
<amp-ad
  width="{APPROPRIATE_WIDTH}"
  height="{APPROPRIATE_HEIGHT}"
  layout="responsive"
  data-revcontent
  type="revcontent"
  data-id="{YOUR_WIDGET_ID}">
</amp-ad>
```

### Evergreen Tag

The evergreen AMP tag leverages new and improved ad code from Revcontent and supports greater performance and customization capabilities:

```html
<amp-ad
  data-widget-id="{YOUR_WIDGET_ID}"
  data-pub-id="{YOUR_PUB_ID}"
  data-placement-type="evergreen"
  width="{APPROPRIATE_WIDTH}"
  height="{APPROPRIATE_HEIGHT}"
  layout="responsive"
  type="revcontent">
</amp-ad>
```

## Configuration

For help with configuration, please contact Revcontent or refer to their documentation.

### Standard Tag Options

#### Required Parameters

-   `data-id`
-   `width`
-   `height`

#### Optional Parameters

-   `data-sub-ids`
-   `data-gam-enabled`
-   `data-gdpr`
-   `data-gdpr-consent`
-   `data-us-privacy`

### Evergreen Tag Options

#### Required Parameters

-   `data-widget-id`
-   `data-pub-id`
-   `width`
-   `height`

#### Optional Parameters

Please contact Revcontent for more information about optional parameters for evergreen tags.
