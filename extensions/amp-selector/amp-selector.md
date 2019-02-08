---
$category@: dynamic-content
formats:
  - websites
  - email
teaser:
  text: Represents a control that presents a menu of options and lets the user choose from it.
---
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

# amp-selector

Represents a control that presents a menu of options and lets the user choose from it.

<table>
  <tr>
    <td class="col-fourty" width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-selector" src="https://cdn.ampproject.org/v0/amp-selector-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>All</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-selector/">amp-selector example</a>.</td>
  </tr>
</table>

[TOC]

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

## Clearing selections
To clear all selections when an element is tapped or clicked, set the [`on`](../../spec/amp-actions-and-events.md) action attribute on the element, and specify the AMP Selector `id` with the `clear` action method.

Example:

```html
<button on="tap:mySelector.clear">Clear Selection</button>
<amp-selector id="mySelector" layout="container" multiple>
  <div option>Option One</div>
  <div option>Option Two</div>
  <div option>Option Three</div>
</amp-selector>
```

{% call callout('Tip', type='success') %}
See live demos at [AMP By Example](https://ampbyexample.com/components/amp-selector/).
{% endcall %}

## Attributes

### Attributes on `<amp-selector>`

<table>
  <tr>
    <td width="40%"><strong>disabled, form, multiple, name</strong></td>
    <td>The attributes above behave the same way as they do on a standard HTML [`<select>`](https://developer.mozilla.org/en/docs/Web/HTML/Element/select) element.</td>
  </tr>
  <tr>
    <td width="40%"><strong>keyboard-select-mode</strong></td>
    <td>The `keyboard-select-mode` attribute dictates the keyboard navigation behavior for options inside `<amp-selector>`.

    <ul><li>`none` (default): The tab key changes focus between items in the `<amp-selector>`. The user must press enter or space to change the selection. Arrow keys are disabled. </li><li>
    `focus`: Tab key gives focus to `<amp-selector>`. The user navigates between items with the arrow keys. Must press space or enter to change the selection.</li><li>
    `select`: Tab key gives focus to `<amp-selector>`. The selection changes as the user navigates options with arrow keys. </li></ul></td>
  </tr>
</table>

### Attributes on `<amp-selector>` options

<table>
  <tr>
    <td width="40%"><strong>option</strong></td>
    <td>Indicates that the option is selectable.  If a value is specified, the contents of the value is submitted with the form.</td>
  </tr>
  <tr>
    <td width="40%"><strong>disabled, selected</strong></td>
    <td>The attributes above behave the same way as they do on a standard HTML [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option) element.</td>
  </tr>
</table>

## Events

Events may trigger actions on other AMP components using the `on` attribute.
e.g. `on="select: my-tab.show"`

Read more about [AMP Actions and Events](../../spec/amp-actions-and-events.md).

<table>
  <tr>
    <td width="40%"><strong>select</strong></td>
    <td>`amp-selector` triggers the `select` event when the user selects an option.
    Multi-selectors and single-selectors fire this when selecting or unselecting options.
    Tapping disabled options does not trigger the `select` event.
    <ul>
      <li>
      `event.targetOption` contains the `option` attribute value of the selected element.</li>
      <li>
      `event.selectedOptions` contains an array of the `option` attribute values of all selected elements.
      </li>
    </ul></td>
  </tr>

</table>

## Validation

See [amp-selector rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-selector/validator-amp-selector.protoascii) in the AMP validator specification.
