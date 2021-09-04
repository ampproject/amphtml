# Tail

How to use AMP data to create, serve ads and create personalized experiences on the web.

## Example

Specify the rtc-config parameter with your Tail Account ID:

```html
<amp-ad width="300" height="250"
  type="doubleclick"
  data-slot="/1234567/medium-rectangle"
  rtc-config="{"vendors": {"tail": {"TAIL_ACCOUNT": "TT-0000-0"}}}">
</amp-ad>
```

## Configuration

Important: Our adapter only supports Google Ad Manager. For the most up-to-date list of Google Ad Manager supported parameters and usage, refer to the [DoubleClick reference guide](https://github.com/ampproject/amphtml/blob/master/ads/google/doubleclick.md).

### Optional Parameters

-   `data-account`: The account identifier to load custom audiences.

If you have any questions, contact your Business Leader or contact us [here](https://tail.digital/contato/).
