<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-dynamic-css-classes"></a> AMP Dynamic CSS Classes

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Adds several dynamic CSS class names onto the <code>&lt;body></code> element.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-dynamic-css-classes" src="https://cdn.ampproject.org/v0/amp-dynamic-css-classes-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-dynamic-css-classes/">amp-dynamic-css-classes</a> example.</td>
  </tr>
</table>

## Behavior

The AMP Dynamic CSS Classes extension adds the following CSS classes
onto the `<body>` element:

**amp-referrer-***

One or more referrer classes will be set, one for each level of
subdomain specificity. For example, `www.google.com` will add three
classes: `amp-referrer-www-google-com`, `amp-referrer-google-com`, and
`amp-referrer-com`.

We currently have a few special cases:

- When the user came through a Twitter `t.co` short link, we instead use
  `twitter.com` as the referrer.
- When the string "Pinterest" is present in the User Agent string and
  there is no referrer, we use `www.pinterest.com` as the referrer.

**amp-viewer**

The `amp-viewer` class will be set if the current document is being
displayed inside a Viewer.
