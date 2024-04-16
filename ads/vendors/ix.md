# Index Exchange AMP RTC

Index Exchange (IX) supports [AMP Real Time Config (RTC)](https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/rtc-publisher-implementation-guide.md) which allows Publishers to augment their ad requests with targeting information that is retrieved at runtime. This document provides instructions on adding IX as a vendor to AMP pages.

## Configuration

Each [amp-ad](https://amp.dev/documentation/components/amp-ad/) element that uses RTC must have the `rtc-config` attribute set with valid JSON.

**Attributes**

-   `<amp-ad>`: Required. IX `<amp-ad>` tags require the `width`, `height`, and `type="doubleclick"` parameters.</br>
    **Note**: IX leverages AMP through Google Ad Manager (GAM, formerly DoubleClick for Publishers).

-   `data-slot`: Required. Data attributes to serve ads.

-   `data-multi-size`: Optional. A string of comma separated sizes, which if present, forces the tag to request an ad with all of the given sizes, including the primary size. The `width` and `height` attributes are always included as one of the valid sizes, unless overridden by `data-override-width` and `data-override-height` attributes which change the size of creatives eligible for the slot. For details refer to the [Multi-size Ad documentation](https://github.com/ampproject/amphtml/blob/main/extensions/amp-ad-network-doubleclick-impl/multi-size.md).

-   `data-multi-size-validation`: Optional. If set to false, this allows secondary sizes specified in the `data-multi-size` attribute to be less than 2/3rds of the corresponding primary size. By default, this is assumed to be true.

-   `rtc-config`: JSON configuration data which handles the communication with AMP RTC.
    -   `vendors` : Required object. The key is `IndexExchange` and the value is the `SITE_ID`.</br>
        **Note:** Refer to the materials provided by your account team for your specific SITE_ID details. We recommend one SITE_ID per domain, per unique slot and size. To use more than one SITE_ID, contact your IX Representative.
    -   `timeoutMillis`: Optional integer. Defines the timeout in milliseconds for each individual RTC callout. The configured timeout must be greater than 0 and less than 1000ms. If omitted, the timeout value defaults to 1000ms.

### Example: RTC Specification on an amp-ad

```
<!-- Note: Default timeout is 1000ms -->
<amp-ad
  width="320"
  height="50"
  type="doubleclick"
  data-slot="/1234/pos"
  rtc-config='{
                "vendors": {
                  "IndexExchange": {"SITE_ID": "123456"}
                },
                "timeoutMillis": 1000
              }'
>
</amp-ad>
```

The value of `rtc-config` must conform to the following specification:

```
{
  "vendors": {
    "IndexExchange": {"SITE_ID": "123456"}
  },
  "timeoutMillis": 1000
}
```

### Example: Multi-size request on an amp-ad

```html
<!-- Note: Default timeout is 1000ms -->
<amp-ad
  width="728"
  height="90"
  type="doubleclick"
  data-slot="/1234/pos"
  data-multi-size="700x90,700x60,500x60"
  rtc-config='{
                "vendors": {
                  "IndexExchange": {"SITE_ID": "123456"}
                },
                "timeoutMillis": 1000
              }'
>
</amp-ad>
```

### Example: Multi-size request on an amp-ad ignoring size validation

```html
<!-- Note: Default timeout is 1000ms -->
<amp-ad
  width="728"
  height="90"
  type="doubleclick"
  data-slot="/1234/pos"
  data-multi-size="300x25"
  data-multi-size-validation="false"
  rtc-config='{
                "vendors": {
                  "IndexExchange": {"SITE_ID": "123456"}
                },
                "timeoutMillis": 1000
              }'
>
</amp-ad>
```

Additional parameters including JSON are passed through in the resulting call to GAM. For details refer to the [Google Ad Manager documentation](https://github.com/ampproject/amphtml/blob/main/extensions/amp-ad-network-doubleclick-impl/amp-ad-network-doubleclick-impl-internal.md).

To learn about the required Google Ad Manager (GAM) configuration, refer to [Index Exchange Knowledge Base](https://kb.indexexchange.com/Mobile/About_AMP.htm).
