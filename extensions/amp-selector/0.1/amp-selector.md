---
$category@: dynamic-content
formats:
  - websites
  - email
teaser:
  text: Represents a control that presents a menu of options and lets the user choose from it.
---

# amp-selector

## Usage

The AMP selector is a control that presents a list of options and lets the user choose one or many options; the contents of the options aren't just limited to text.

-   An `amp-selector` can contain any arbitrary HTML elements or AMP components (e.g., `amp-carousel`, `amp-img`, etc.).
-   An `amp-selector` cannot contain any nested `amp-selector` controls.
-   Selectable options can be set by adding the `option` attribute to the element and assigning a value to the attribute (e.g., `<li option='value'></li>`).
-   Disabled options can be set by adding the `disabled` attribute to the element (e.g., `<li option='d' disabled></li>`).
-   Preselected options can be set by adding the `selected` attribute to the element (e.g., `<li option='b' selected></li>`).
-   To allow for multiple selections, add the `multiple` attribute to the `amp-selector` element. By default, the `amp-selector` allows for one selection at a time.
-   To disable the entire `amp-selector`, add the `disabled` attribute to the `amp-selector` element.
-   When an `amp-selector` contains a `name` attribute and the `amp-selector` is inside a `form` tag, if a submit event occurs on the form, the `amp-selector`behaves like a radio-button/checkbox group and submits the selected values (the ones assigned to the option) against the name of the `amp-selector`.

Example:

```html
<form action="/" method="get" target="_blank" id="form1">
  <amp-selector layout="container" name="single_image_select">
    <ul>
      <li>
        <amp-img src="/img1.png" width="50" height="50" option="1"></amp-img>
      </li>
      <li>
        <amp-img src="/img2.png" width="50" height="50" option="2"></amp-img>
      </li>
      <li option="na" selected>None of the Above</li>
    </ul>
  </amp-selector>
  <amp-selector layout="container" name="multi_image_select" multiple>
    <amp-img src="/img1.png" width="50" height="50" option="1"></amp-img>
    <amp-img src="/img2.png" width="50" height="50" option="2"></amp-img>
    <amp-img src="/img3.png" width="50" height="50" option="3"></amp-img>
  </amp-selector>
  <amp-selector layout="container" name="multi_image_select_1" multiple>
    <amp-carousel id="carousel-1" width="200" height="60" controls>
      <amp-img src="/img1.png" width="80" height="60" option="a"></amp-img>
      <amp-img
        src="/img2.png"
        width="80"
        height="60"
        option="b"
        selected
      ></amp-img>
      <amp-img src="/img3.png" width="80" height="60" option="c"></amp-img>
      <amp-img
        src="/img4.png"
        width="80"
        height="60"
        option="d"
        disabled
      ></amp-img>
    </amp-carousel>
  </amp-selector>
</form>
<amp-selector
  layout="container"
  name="multi_image_select_2"
  multiple
  form="form1"
>
  <amp-carousel id="carousel-1" width="400" height="300" type="slides" controls>
    <amp-img src="/img1.png" width="80" height="60" option="a"></amp-img>
    <amp-img
      src="/img2.png"
      width="80"
      height="60"
      option="b"
      selected
    ></amp-img>
    <amp-img src="/img3.png" width="80" height="60" option="c"></amp-img>
    <amp-img src="/img4.png" width="80" height="60" option="d"></amp-img>
  </amp-carousel>
</amp-selector>
```

### Clearing selections

To clear all selections when an element is tapped or clicked, set the [`on`](../../../docs/spec/amp-actions-and-events.md) action attribute on the element, and specify the AMP Selector `id` with the `clear` action method.

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
See live demos at [AMP By Example](https://amp.dev/documentation/examples/components/amp-selector/).
{% endcall %}

## Attributes

### Attributes on `<amp-selector>`

#### disabled, form, multiple, name

The attributes above behave the same way as they do on a standard HTML [`<select>`](https://developer.mozilla.org/en/docs/Web/HTML/Element/select) element.

#### keyboard-select-mode

The `keyboard-select-mode` attribute dictates the keyboard navigation behavior for options inside `<amp-selector>`.

<ul>
  <li>
    `none` (default): The tab key changes focus between items in the `<amp-selector>`. The user must press enter or space to change the selection. Arrow keys are disabled.
  </li>
  <li>
    `focus`: Tab key gives focus to `<amp-selector>`. The user navigates between items with the arrow keys. Must press space or enter to change the selection.
  </li>
  <li>
    `select`: Tab key gives focus to `<amp-selector>`. The selection changes as the user navigates options with arrow keys.
  </li>
</ul>

### Attributes on `<amp-selector>` options

#### option

Indicates that the option is selectable. If a value is specified, the contents of the value is submitted with the form.

#### disabled, selected

The attributes above behave the same way as they do on a standard HTML [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option) element.

## Events

Events may trigger actions on other AMP components using the `on` attribute.
e.g. `on="select: my-tab.show"`

Read more about [AMP Actions and Events](../../../docs/spec/amp-actions-and-events.md).

### select

`amp-selector` triggers the `select` event when the user selects an option.
Multi-selectors and single-selectors fire this when selecting or unselecting options.
Tapping disabled options does not trigger the `select` event.

<ul>
  <li>
  `event.targetOption` contains the `option` attribute value of the selected element.</li>
  <li>
  `event.selectedOptions` contains an array of the `option` attribute values of all selected elements.
  </li>
</ul>

## Validation

See [amp-selector rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-selector/validator-amp-selector.protoascii) in the AMP validator specification.
