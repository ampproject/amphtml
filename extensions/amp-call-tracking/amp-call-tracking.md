---
$category@: ads-analytics
formats:
  - websites
teaser:
  text: Dynamically replaces a phone number in a hyperlink to enable call tracking. 
---

# amp-call-tracking

## Usage

Dynamically replaces a phone number in a hyperlink to enable call
tracking. Executes a CORS request to substitute the number.

The `<amp-call-tracking>` tag must wrap a normal anchor tag that hyperlinks a
phone number. This phone number will be replaced with the values provided
by a CORS endpoint.

```html
<amp-call-tracking config="https://example.com/calltracking.json">
  <a href="tel:123456789">+1 (23) 456-789</a>
</amp-call-tracking>
```

Each unique CORS endpoint is called only once per page.

### Related documentation

-   [Design doc](https://docs.google.com/document/d/1UDMYv0f2R9CvMUSBQhxjtkSnC4984t9dJeqwm_8WiAM/edit#heading=h.zha4avn54it8)
-   [PR](https://github.com/ampproject/amphtml/pull/7493)

## Attributes

### `config` (required)

Defines a CORS URL. The URL's protocol must be HTTPS. The response must consist
of a valid JSON object with the following fields:

-   `phoneNumber` (required): Specifies the phone number to call when the user
    clicks the link.

-   `formattedPhoneNumber` (optional): Specifies the phone number to display. If
    not specified, the value in `phoneNumber` is used.

Your XHR endpoint must implement the requirements specified in the [CORS Requests in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests).

## Validation

See [amp-call-tracking rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-call-tracking/validator-amp-call-tracking.protoascii) in the AMP validator specification.
