# Navegg

Serves ads to AMP pages using Navegg data.

## Example

To get Navegg integration working you only need to specify the `rtc-config` parameter with your Navegg Account ID:

```html
<amp-ad width="320" height="50"
  type="doubleclick"
  data-slot="/4119129/mobile_ad_banner"
  rtc-config="{"vendors": {"navegg": {"NVG_ACC": "NAVEGG_ACCOUNT_ID"}}}">
</amp-ad>
```

### Configuration

The Navegg adapter only supports DoubleClick for now. For the most up-to-date list of DoubleClick supported parameters and usage, refer to the [DoubleClick reference guide](https://github.com/ampproject/amphtml/blob/main/ads/google/doubleclick.md).

For any help, please contact [Navegg](https://www.navegg.com/en/institutional/#contact).
