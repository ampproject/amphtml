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

# <a name="amp-flying-carpet"></a> `amp-flying-carpet`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>A flying carpet wraps its children in a unique full-screen scrolling container. In particular, this allows you to display a full-screen ad without taking up the entire viewport, making for a better user experience.</td>
  </tr>
  <tr>
    <td class="col-fourty" width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-flying-carpet" src="https://cdn.ampproject.org/v0/amp-flying-carpet-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-flying-carpet">amp-flying-carpet.html</a></td>
  </tr>
</table>

## Behavior

`amp-flying-carpet` displays its children inside a container of fixed height. As the user scrolls the page, the flying carpet reveals more of it contents, sliding across its children as if peering through a window in the page.

Example:

```html
<amp-flying-carpet height="300px">
  <amp-img src="fullscreen.png" width="100vw" height="100vh"></amp-img>
</amp-flying-carpet>
```

## Attributes

**height**

The height of the flying carpets "window".

## Styling

- You may use the `amp-flying-carpet` element selector to style it freely.
- `amp-flying-carpet` elements are always `position: relative`.

## Validation errors

The following lists validation errors specific to the `amp-flying-carpet` tag
(see also `amp-flying-carpet` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-flying-carpet/0.1/validator-amp-flying-carpet.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
</table>
