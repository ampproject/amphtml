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
    <td><code><script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script></code></td>
  </tr>
</table>

## Behavior

The 'fake' ad network produces only a single ad request to localhost and 
attempts to render it via the A4A fast rendering path.  It is intended only 
for testing and demos.  It is disabled outside of local development or 
testing modes.

Like all A4A ad networks, you do not place an `<amp-ad-network-fake-impl>` 
tag directly on the page.  Instead, you place an `<amp-ad type="fake">` tag.

The fake impl loads a creative from a JSON-formatted file containing two 
fields: `"creative"` and `"signature"`.  The `signature` field **must** be a 
valid signature for the text of the `creative` field, according to at least 
one of the built-in A4A keys.  (_Note:_ A4A will discontinue built-in keys 
when the ability to fetch keys live from the validation service is available.)

## Attributes

Fake impl largely uses the same tags as `<amp-ad>`.  The following are 
special tags for fake or special behaviors of existing tags:

**type** Must be `"fake"`.

**src** Must be a bare filename for a single `.json` file.  Fake will attempt
 to load the file from
 `/extensions/amp-ad-network-fake-impl/0.1/data/${src}`.
 
**data-use-a4a**  If non-empty, fake will attempt to render via the A4A 
pathway (i.e., fast rendering for AMP creatives).  Otherwise, it will attempt
to render via the delayed iframe path.

_Note 1_: `data-use-a4a` is special-purpose to the fake impl, for testing 
purposes only.  It does not exist for `amp-ad` or A4A in general.

_Note 2_: Currently, there is no equivalent "fake" network implementation for
the delayed iframe (a.k.a., "3p") ad rendering pathway.  So attempts to use
fake impl _without_ the `data-use-a4a` parameter will fail.
