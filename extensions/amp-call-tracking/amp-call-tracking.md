---
$category@: ads-analytics
formats:
  - websites
teaser:
  text: Displays GL Transmission Format (gITF) 3D models.
---

<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

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

- [Design doc](https://docs.google.com/document/d/1UDMYv0f2R9CvMUSBQhxjtkSnC4984t9dJeqwm_8WiAM/edit#heading=h.zha4avn54it8)
- [PR](https://github.com/ampproject/amphtml/pull/7493)

## Attributes

### `config` (required)

Defines a CORS URL. The URL's protocol must be HTTPS. The response must consist
of a valid JSON object with the following fields:

- `phoneNumber` (required): Specifies the phone number to call when the user
  clicks the link.

- `formattedPhoneNumber` (optional): Specifies the phone number to display. If
  not specified, the value in `phoneNumber` is used.

Your XHR endpoint must implement the requirements specified in the [CORS Requests in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests).

## Validation

See [amp-call-tracking rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-call-tracking/validator-amp-call-tracking.protoascii) in the AMP validator specification.
