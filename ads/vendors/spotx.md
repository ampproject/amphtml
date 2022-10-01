# SpotX

## Example

### Basic

```html
<amp-ad
  width="300"
  height="250"
  type="spotx"
  data-spotx_channel_id="85394"
  data-spotx_autoplay="1"
>
</amp-ad>
```

### Using Custom Key-Value Pairs

```html
<amp-ad
  width="300"
  height="250"
  type="spotx"
  data-spotx_channel_id="85394"
  data-spotx_custom='{"key1": "val1", "key2": "val2"}'
>
</amp-ad>
```

## Configuration

The SpotX `amp-ad` integration has many of the same capabilities and options as our SpotX EASI integration. For full list of options, please see the [SpotX EASI integration documentation](https://developer.spotxchange.com/content/local/docs/sdkDocs/EASI/README.md#common-javascript-attributes).

### Required parameters

-   `data-spotx_channel_id`
-   `width`
-   `height`
