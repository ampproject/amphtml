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
    <td>AMP selector represents a control that presents a menu of options and lets the user choose from it.</td>
  </tr>
  <tr>
    <td class="col-fourty" width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>All</td>
  </tr>
</table>

## Behavior
AMP select is a control that presents a list of options and lets the user choose one or many.

- An `amp-selector` can contain any arbitrary HTML elements or AMP components.
- An `amp-selector` cannot contain any nested `amp-selector`s
- Selectable options are marked by setting an `option` attribute on the element and assign a value to it. Example: `<li option='value'></li>`
- One or more options can be disabled by marking them with the `disabled` attribute.
- The entire amp-selector could be disabled by adding the `disabled` attribute on the `amp-selector` element itself.
- The selector by default allows one selection at a time, when the `multiple` attribute is added to the `amp-selector` element it enables multiple options to be selected at the same time.
- Options can be pre-selected by adding the `selected` attribute to one or more options.
- When an `amp-selector` has a `name` attribute and is put inside a `form` tag and a submit event occurs on the corresonding form the selector behaves like a radio-button/checkbox group and submits the selected values (the ones assigned to the option) against the name of the selector.

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

##Attributes
### disabled, form, multiple, name

The attributes above should all behave like they do on standard HTML select.

###Attributes on the options
#### disabled, selected

The attributes above should all behave like they do on standard HTML option.
