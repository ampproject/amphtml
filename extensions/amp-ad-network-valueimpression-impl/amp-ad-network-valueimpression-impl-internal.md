# amp-ad-network-valueimpression-impl

ValueImpression implementation of AMP Ad tag which requests early by XHR and renders natively within the page if a valid AMP Ad is returned. Should not be directly referenced by pages and instead is dynamically loaded via the amp-ad tag. However, in order to remove an async script load of this library, publishers can include its script declaration.

<table>
  <tr>
    <td class="col-fourty" width="50%"><strong>Availability</strong></td>
    <td>In Development</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
</table>

ValueImpression uses the Real Time Config (RTC) to preload configuration settings for ad placements. So the ad tag only works when the install is loaded via the RTC from the following endpoint: `https://useast.quantumdex.io/ampv2`

The following parameters are required

<table>
  <tr>
    <td class="col-fourty" width="50%"><strong>client</strong></td>
    <td>We set this value to "23" and cannot be changed by the publisher</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>metadata</strong></td>
    <td>We set this value to "autoCollect" and cannot be changed by the publisher</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>tagid</strong></td>
    <td>Tag ID is provided by valueimpression for each ad position. Example: 1234</td>
  </tr>
</table>

## Example

```html
<amp-ad
  width="300"
  height="250"
  type="valueimpression"
  rtc-config='{
    "urls": [
        "https://useast.quantumdex.io/ampv2?client=26&metadata=autoCollect&tagid=1234"
    ]
  }'>
</amp-ad>
```
