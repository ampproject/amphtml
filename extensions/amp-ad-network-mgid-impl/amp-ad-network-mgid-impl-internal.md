# amp-ad-network-mgid-impl

Mgid implementation of AMP Ad, which is only used for amp-stories.
3p iframe implementation is used for all other cases.

<table>
  <tr>
    <td class="col-fourty" width="50%"><strong>Availability</strong></td>
    <td>In Development</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"&gt;&lt;/script&gt;&lt;script async custom-element="amp-story-auto-ads" src="https://cdn.ampproject.org/v0/amp-story-auto-ads-0.1.js"&gt;&lt;/script></code></td>
  </tr>
</table>

## Example

```html
<amp-story standalone supports-landscape>
  <amp-story-auto-ads>
    <script type="application/json">
      {
        "ad-attributes": {
          "type": "mgid",
          "data-widget": 123456
        }
      }
    </script>
  </amp-story-auto-ads>
  ...
</amp-story>
```
