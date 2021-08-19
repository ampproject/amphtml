# fake-delayed

A fake ad type that is used for local development and testing.

## Example

```html
<amp-ad
  width="300"
  height="250"
  type="fake-delayed"
  data-bootstrap-script="/examples/amp-ad/sticky.js"
  src="/examples/amp-ad/sticky-creative.html"
>
</amp-ad>
```

## Configuration

### Required parameters

-   `src` : The URL of the target creative to be displayed.
-   `data-bootstrap-script` : The URL of a bootstraping JS code to be loaded in iframe s.
