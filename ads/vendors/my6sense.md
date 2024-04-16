# My6sense

My6sense specializes in the development and distribution of its own ad server technology, which is called My6sense ad serving. The My6sense ad server now supports AMP.
For more information, visit [www.My6sense.com](https://www.My6sense.com).

## Example

```html
<amp-ad
  width="300"
  height="250"
  type="my6sense"
  data-widget-key="your-widget-key"
  data-zone="[ZONE]"
  data-url="[PAGE_URL]"
  data-organic-clicks="[ORGANIC_TRACKING_PIXEL]"
  data-paid-clicks="[PAID_TRACKING_PIXEL]"
>
</amp-ad>
```

## Configuration

For semantics of configuration and examples, sign-in and see the [My6sense platform](https://my6sense.com/platform/) or [contact My6sense](https://my6sense.com/contact/).

## Required parameters:

-   `data-widget-key` : string, non-empty

## Optional parameters:

-   `data-zone` : string, non-empty
-   `data-url` : string, non-empty
-   `data-organic-clicks` : string, non-empty
-   `data-paid-clicks` : string, non-empty
