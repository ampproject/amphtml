# PromoteIQ

Provides support for AMP integration with [PromoteIQ](https://www.promoteiq.com/).

## Example

```html
<amp-ad
  width="250"
  height="250"
  type="promoteiq"
  data-src="https://example.com/cdn/file.js"
  data-params='{"param1": "XXX", "param2": "YYY", ....}'
  data-sfcallback="function (response){ return response;}"
>
</amp-ad>
```

### Required parameters

-   `data-src`: Publisher specific PromoteIQ CDN file.
-   `data-input`: JSON stringified inputs.
-   `data-sfcallback`: Stringified publisher rendering function.

# Support

For further queries, please feel free to reach out to your contact at PromoteIQ.
