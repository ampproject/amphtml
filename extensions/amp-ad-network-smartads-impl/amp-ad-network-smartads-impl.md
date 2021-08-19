# amp-ad-network-smartads-impl

SmartAds implementation of AMP Ad tag which requests early by XHR and renders natively within the page if a valid AMP Ad is returned. Should not be directly referenced by pages and instead is dynamically loaded via the amp-ad tag. However, in order to remove an async script load of this library, publishers can include its script declaration.

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

## Example

```html
<amp-ad
  width="300"
  height="250"
  type="smartads"
  data-use-a4a="true"
  data-buid="123"
  src="https://smart-ads.biz/_a4a"
>
</amp-ad>
```

## Attributes

SmartAds impl uses the same attributes as `<amp-ad>` .

<table>
  <tr>
    <td width="40%"><strong>data-use-a4a</strong></td>
    <td>If non-empty, SmartAds will attempt to render via the A4A
    pathway (i.e., fast rendering for AMP creatives).  Otherwise, it will attempt
    to render via the delayed iframe path.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-buid</strong></td>
    <td>Unique block id</td>
  </tr>
</table>
