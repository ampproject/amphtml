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

# <a name="amp-fx-flying-carpet"></a> `amp-fx-flying-carpet`

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
    <td><code>&lt;script async custom-element="amp-fx-flying-carpet" src="https://cdn.ampproject.org/v0/amp-fx-flying-carpet-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-fx-flying-carpet/">Annotated code example for amp-fx-flying-carpet</a></td>
  </tr>
</table>

## Behavior

`amp-fx-flying-carpet` displays its children inside a container of fixed height. As the user scrolls the page, the flying carpet reveals more of it contents, sliding across its children as if peering through a window in the page.

Example:

```html
<amp-fx-flying-carpet height="300px">
  <amp-img src="fullscreen.png" width="300" height="500" layout="responsive"></amp-img>
</amp-fx-flying-carpet>
```

## Attributes

**height**

The height of the flying carpets "window".

## Styling

- You may use the `amp-fx-flying-carpet` element selector to style it freely.
- `amp-fx-flying-carpet` elements are always `position: relative`.

## Validation errors

The following lists validation errors specific to the `amp-fx-flying-carpet` tag
(see also `amp-fx-flying-carpet` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-fx-flying-carpet/0.1/validator-amp-fx-flying-carpet.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
</table>
