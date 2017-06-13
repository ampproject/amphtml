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

# <a name="amp-selector"></a> `amp-selector`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Represents a control that presents a menu of options and lets the user choose from it.</td>
  </tr>
  <tr>
    <td class="col-fourty" width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td class="col-fourty" width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-selector" src="https://cdn.ampproject.org/v0/amp-selector-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>All</td>
  </tr>
</table>

## Behavior

The AMP selector is a control that presents a list of options and lets the user choose one or many options; the contents of the options aren't just limited to text.

- An `amp-selector` can contain any arbitrary HTML elements or AMP components (e.g., `amp-carousel`, `amp-img`, etc.).
- An `amp-selector` cannot contain any nested `amp-selector` controls.
- Selectable options can be set by adding the `option` attribute to the element and assigning a value to the attribute (e.g., `<li option='value'></li>`).
- Disabled options can be set by adding the `disabled` attribute to the element (e.g.,  `<li option='d' disabled></li>`).
- Preselected options can be set by adding the `selected` attribute to the element (e.g.,  `<li option='b' selected></li>`).
- To allow for multiple selections, add the `multiple` attribute to the `amp-selector` element.  By default, the `amp-selector` allows for one selection at a time. 
- To disable the entire `amp-selector`, add the `disabled` attribute to the `amp-selector` element.
- When an `amp-selector` contains a `name` attribute and the `amp-selector` is inside a `form` tag, if a submit event occurs on the form, the `amp-selector`behaves like a radio-button/checkbox group and submits the selected values (the ones assigned to the option) against the name of the `amp-selector`.

Example:

```html
<form action="/" method="get" target="_blank" id="form1">
  <amp-selector layout="container" name="single_image_select">
    <ul>
      <li><amp-img src="/img1.png" width=50 height=50 option="1"></amp-img></li>
      <li><amp-img src="/img2.png" width=50 height=50 option="2"></amp-img></li>
      <li option="na" selected>None of the Above</li>
    </ul>
  </amp-selector>
  <amp-selector layout="container" name="multi_image_select" multiple>
    <amp-img src="/img1.png" width=50 height=50 option="1"></amp-img>
    <amp-img src="/img2.png" width=50 height=50 option="2"></amp-img>
    <amp-img src="/img3.png" width=50 height=50 option="3"></amp-img>
  </amp-selector>
  <amp-selector layout="container" name="multi_image_select_1" multiple>
    <amp-carousel id="carousel-1" width=200 height=60 controls>
      <amp-img src="/img1.png" width=80 height=60 option="a"></amp-img>
      <amp-img src="/img2.png" width=80 height=60 option="b" selected></amp-img>
      <amp-img src="/img3.png" width=80 height=60 option="c"></amp-img>
      <amp-img src="/img4.png" width=80 height=60 option="d" disabled></amp-img>
    </amp-carousel>
  </amp-selector>
</form>
<amp-selector layout="container" name="multi_image_select_2" multiple form="form1">
  <amp-carousel id="carousel-1" width=400 height=300 type=slides controls>
    <amp-img src="/img1.png" width=80 height=60 option="a"></amp-img>
    <amp-img src="/img2.png" width=80 height=60 option="b" selected></amp-img>
    <amp-img src="/img3.png" width=80 height=60 option="c"></amp-img>
    <amp-img src="/img4.png" width=80 height=60 option="d"></amp-img>
  </amp-carousel>
</amp-selector>
```

## Attributes

### Attributes on `<amp-selector>`

**disabled, form, multiple, name**

The attributes above behave the same way as they do on a standard HTML [`<select>`](https://developer.mozilla.org/en/docs/Web/HTML/Element/select) element.

### Attributes on `<amp-selector>` options

**option**

Indicates that the option is selectable.  If a value is specified, the contents of the value is submitted with the form.

**disabled, selected**

The attributes above behave the same way as they do on a standard HTML [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option) element.

## Validation

See [amp-selector rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-selector/validator-amp-selector.protoascii) in the AMP validator specification.
