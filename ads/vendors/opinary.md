# Opinary

## Example

### AMS / Automated Matching System

The automated matching system is an algorithm developed by Opinary which matches polls to articles.

```html
<amp-embed
  width="500"
  height="1"
  type="opinary"
  layout="intrinsic"
  data-client="test-success"
>
</amp-embed>
```

### Embed / Manual Integration

If you want to show a specific poll, you need to include the poll parameter, as shown in the example below.

```html
<amp-embed
  width="500"
  height="500"
  type="opinary"
  layout="intrinsic"
  data-client="test-success"
  data-poll="freuen-sie-sich-ber-schnee_production-at-bKwLEv"
>
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact the Opinary account manager or refer to their documentation.

### Required parameters

-   `data-client` - the customer name

### Optional parameters

-   `data-poll` - the ID of the poll you want to show
