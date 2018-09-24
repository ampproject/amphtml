<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-ad-network-fake-impl"></a> `amp-ad-network-fake-impl`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>This is a fake ad network implementation for local testing only.
    It produces only one 'request', for a local resource.</td>
  </tr>
  <tr>
    <td class="col-fourty" width="40%"><strong>Availability</strong></td>
    <td>Development</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
</table>

## Behavior

The 'fake' ad network produces only a single ad request and
attempts to render it via the A4A fast rendering path.  It is intended only
for testing and demos. To send an ad request with 'fake' ad network, it is
required that the ad element to have an id value starts with `i-amphtml-demo-`
which makes the AMP page invalid.

Like all A4A ad networks, you do not place an `<amp-ad-network-fake-impl>`
tag directly on the page.  Instead, you place an `<amp-ad type="fake">` tag.

The fake impl loads an A4A creative or an AMP creative and convert it to an A4A
creative. Use `a4a-conversion` attribute to instruct the fake impl to perform creative
conversion.

The fake impl will skip signature verification by default. To enforce this check,
set `checksig` attribute. This can be useful to test the ad's behavior when signature
verification fails.

## Attributes

Fake impl largely uses the same tags as `<amp-ad>`.  The following are
special tags for fake or special behaviors of existing tags:

**id** Must starts with `i-amphtml-demo-` to enable sending ad request.

**type** Must be `"fake"`.

**src** The file source.

**a4a-conversion** To instruct the fake impl to convert creative response to A4A creative.

**checksig** To enforce the signature check.
