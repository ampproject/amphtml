---
$category@: media
formats:
  - websites
teaser:
  text: Displays any Playbuzz content (e.g., list, poll, etc.).
---
<!---
Copyright 2017 The AMP HTML Authors.

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

# amp-playbuzz

Displays any Playbuzz item content (e.g., list, poll, etc.)<br>
Can be any item URL taken from <a href="http://www.playbuzz.com">playbuzz.com

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-playbuzz" src="https://cdn.ampproject.org/v0/amp-playbuzz-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fixed-height, responsive</td>
  </tr>
</table>


## Examples

Playbuzz Item by plain url (without info, share-buttons, comments)

```html
<amp-playbuzz
    src="https://www.playbuzz.com/HistoryUK/10-classic-christmas-movies"
    height="500">
</amp-playbuzz>
```

Playbuzz Item by item-id (can be found in the item's embed code)

```html
<amp-playbuzz
    data-item="a6aa5a14-8888-4618-b2e3-fe6a30d8c51b"
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
### One of the following is required:
<table>
  <tr>
    <td width="40%"><strong>src</strong></td>
    <td>The URL for the Playbuzz item.
    Can be any item URL taken from <a href="http://www.playbuzz.com">playbuzz.com</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-item</strong></td>
    <td>The item id for the Playbuzz item.
    Can be taken from the item's embed code (at the item's page at playbuzz website)</td>
  </tr>
</table>

**Note**: If both attributes are present, `data-item` is used.

## Optional attributes

<table>
  <tr>
    <td width="40%"><strong>data-item-info </strong> (optional)</td>
    <td>Indicates whether to display data info, such as creation date, creator name, etc.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-share-buttons</strong> (optional)</td>
    <td>Indicates whether to display share buttons.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-comments</strong> (optional)</td>
    <td>Indicates whether to display users' comments.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-playbuzz rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-playbuzz/validator-amp-playbuzz.protoascii) in the AMP validator specification.
