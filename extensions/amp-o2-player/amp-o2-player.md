---
$category@: media
formats:
  - websites
teaser:
  text: Displays an AOL O2Player.
---

<!---
Copyright 2016 O2Player. All Rights Reserved.

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

# amp-o2-player

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-o2-player
  data-pid="12345"
  data-bcid="5678"
  data-bid="54321"
  data-vid="98765"
  layout="responsive"
  width="480"
  height="270"
>
</amp-o2-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-pid (required)</strong></td>
    <td>The Player ID for the O2Player.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-bcid (required)</strong></td>
    <td>The Buyer Company ID (bcid) for the O2Player.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-bid</strong></td>
    <td>The Playlist ID (bid) for the O2Player.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-vid</strong></td>
    <td>The Video ID (vid) for the O2Player.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-macros</strong></td>
    <td>The macros for the O2Player.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-o2-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-o2-player/validator-amp-o2-player.protoascii) in the AMP validator specification.

The following lists validation errors specific to the `amp-o2-player` tag:

<table>
  <tr>
    <th class="col-fourty"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validation_errors#tag-required-by-another-tag-is-missing">The 'example1' tag is missing or incorrect, but required by 'example2'.</a></td>
    <td>Error thrown when required <code>amp-o2-player</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when implied layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when specified layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-property-value">The property 'example1' in attribute 'example2' in tag 'example3' is set to 'example4', which is invalid.</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
</table>

## Consent Data

Iframe inside `amp-o2-player` can send a message to receive consent data if a CMP is present on `amp-o2-player` parents page.

Example request for consent data from iframe:

```javascript
window.parent.postMessage(
  {
    sentinel: 'amp',
    type: 'send-consent-data',
  },
  '*'
);
```

Example receive response for consent data:

```javascript
function isAmpMessage(event, type) {
  return (
    event.source == window.parent &&
    event.origin != window.location.origin &&
    event.data &&
    event.data.sentinel == 'amp' &&
    event.data.type == type
  );
}

window.addEventListener('message', function (event) {
  if (!isAmpMessage(event, 'consent-data')) {
    return;
  }
  console.log(event.data.consentData);
});
```
