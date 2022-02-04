# Yieldbot

Yieldbot can be configured as a demand source by using the Real Time Config (RTC) callout vendor specification. To be a demand source, Yieldbot is configured as an `rtc-config` vendor within an `amp-ad` network tag configuration. Specific Yieldbot publisher identifier and slot name configuration is made using callout vendor substitution macros listed in the table below.

## Yieldbot Vendor Callout Macros

| Parameter     | Description                    |
| :------------ | :----------------------------- |
| **`YB_PSN`**  | Yieldbot publisher site number |
| **`YB_SLOT`** | Yieldbot slot identifier       |

For further information on RTC please see the [RTC Publisher Implementation Guide](https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/rtc-publisher-implementation-guide.md) and see the example Doubleclick configuration below.

## Doubleclick RTC Configuration

To specify a Doubleclick `amp-ad` integration with Yieldbot, include the vendor `"yieldbot"` in your `rtc-config` tag attributed as shown in the example below. This particular example shows that the Yieldbot demand configuration for the respective Doubleclick slot, `/2476204/medium-rectangle` where:

-   `"YB_PSN": "1234"`, Yieldbot publisher number
-   `"YB_SLOT": "medrec"`, Yieldbot slot name

```html
<amp-ad
  width="300"
  height="250"
  type="doubleclick"
  rtc-config='{
          "vendors": {
            "yieldbot": {
              "YB_PSN": "1234",
              "YB_SLOT": "medrec"
            }
          }
        }'
  data-slot="/2476204/medium-rectangle"
  data-multi-size="300x220,300x200"
  json='{"targeting":{"category":["food","lifestyle"]},"categoryExclusions":["health"]}'
>
</amp-ad>
```

### Yieldbot Integration Testing

For integration testing, the Yieldbot Platform can be set to always return a bid for requested slots.

-   **Enable** integration testing mode:
    -   http://i.yldbt.com/integration/start
-   **Disable** integration testing mode:
    -   http://i.yldbt.com/integration/stop

When Yieldbot testing mode is enabled, a cookie (`__ybot_test`) on the domain `.yldbt.com` tells the Yieldbot ad server to always return a bid and when creative is requested, return a static integration testing creative.

**_Note:_**

-   No ad serving metrics are impacted when integration testing mode is enabled.
-   The `__ybot_test` cookie expires in 24 hours.
-   It is good practice to action the "Stop testing" Url when testing is complete to return to normal ad delivery.
