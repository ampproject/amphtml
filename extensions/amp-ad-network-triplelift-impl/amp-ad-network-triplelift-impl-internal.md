# amp-ad-network-triplelift-impl

TripleLift implementation of AMP Ad tag which requests early by XHR and renders natively within the page if a valid AMP Ad is returned. Should not be directly referenced by pages and instead is dynamically loaded via the amp-ad tag. However, in order to remove an async script load of this library, publishers can include its script declaration.

## Behavior

The TripleLift ad network produces only a single ad request to `amp.3lift.com` and
attempts to render it via the A4A fast rendering path.

Like all A4A ad networks, you do not place an `<amp-ad-network-triplelift-impl>`
tag directly on the page. Instead, you place an `<amp-ad type="triplelift">` tag.

The TripleLift impl loads a creative from a JSON-formatted file containing two
fields: `"creative"` and `"signature"`. The `signature` field **must** be a
valid signature for the text of the `creative` field.

## Attributes

TripleLift impl uses the same tags as `<amp-ad>`.

<table>
  <tr>
    <td width="40%"><strong>data-use-a4a</strong></td>
    <td>If non-empty, TripleLift will attempt to render via the A4A
    pathway (i.e., fast rendering for AMP creatives).  Otherwise, it will attempt
    to render via the delayed iframe path.
</td>
  </tr>
</table>
