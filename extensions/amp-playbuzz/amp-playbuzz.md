<!---
Copyright 2015 The AMP HTML Authors.

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

# <a name=”amp-pinterest”></a> `amp-playbuzz`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a Playbuzz item</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-playbuzz" src="https://cdn.ampproject.org/v0/amp-playbuzz-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed-height, responsive</td>
  </tr>
</table>

## Examples:

Playbuzz Item (without info, share-buttons, comments)

```html
  <amp-playbuzz
        src="https://www.playbuzz.com/HistoryUK/10-classic-christmas-movies"
        height="500">
  </amp-playbuzz>
```

With optional parameters (info, share-buttons, comments):

```html
  <amp-playbuzz
        src="https://www.playbuzz.com/HistoryUK/10-classic-christmas-movies"
        height="500"
        data-item-info="true"
        data-share-buttons="true"
        data-comments="true">
  </amp-playbuzz>
```

## Required attributes

**src**

Playbuzz item URL

## Optional attributes

**data-item-info**

Display data info such as creation date, creator name, etc..

**data-share-buttons**

Display share buttons

**data-comments**

Display users' comments

## Validation

See [amp-playbuzz rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-playbuzz/0.1/validator-amp-playbuzz.protoascii) in the AMP validator specification.
