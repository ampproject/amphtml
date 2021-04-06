---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Represents a control that presents a menu of options and lets the user choose from it.
experimental: true
bento: true
---

<!---
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

## Usage

The AMP selector is a control that presents a list of options and lets the user choose one or many options; the contents of the options aren't just limited to text.

-   An `amp-selector` can contain any arbitrary HTML elements or AMP components (e.g., `amp-carousel`, `amp-img`, etc.).
-   An `amp-selector` cannot contain any nested `amp-selector` controls.
-   Selectable options can be set by adding the `option` attribute to the element and assigning a value to the attribute (e.g., `<li option="value"></li>`).
-   Disabled options can be set by adding the `disabled` attribute to the element (e.g., `<li option="d" disabled></li>`).
-   Preselected options can be set by adding the `selected` attribute to the element (e.g., `<li option="b" selected></li>`).
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

### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-selector` component in standalone use.

[example preview="top-frame" playground="false"]

```html
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-selector-1.0.css">
  <script async custom-element="amp-selector" src="https://cdn.ampproject.org/v0/amp-selector-1.0.js"></script>
</head>
<amp-selector id="my-selector">
  <ul>
    <li option="1">Option 1</li>
    <li option="2">Option 2</li>
    <li option="3">Option 3</li>
    <li option="4">Option 4</li>
    <li option="5">Option 5</li>
    <li option="6">Option 6</li>
  </ul>
</amp-selector>
<button id="select-down-button">Select next item</button>
<button id="select-up-button">Select previous item</button>
<button id="toggle-button">Toggle Option 3</button>
<script>
  (async () => {
    const selector = document.querySelector("#my-selector");
    await customElements.whenDefined("amp-selector");
    const api = await selector.getApi();

    // set up button actions
    document.querySelector("#select-down-button").onclick = () => api.selectBy(1);
    document.querySelector("#select-up-button").onclick = () => api.selectBy(-1);
    document.querySelector("#toggle-button").onclick = () => api.toggle("3");
  })();
</script>
```

[/example]

#### Interactivity and API usage

Bento enabled components in standalone use are highly interactive through their API. In Bento standalone use, the element's API replaces AMP Actions and events and [`amp-bind`](https://amp.dev/documentation/components/amp-bind/?format=websites).

The `amp-selector` component API is accessible by including the following script tag in your document:

```js
await customElements.whenDefined("amp-selector");
const api = await selector.getApi();
```

##### Actions

The `amp-selector` API allows you to perform the following actions:

**selectBy(delta: number)**
Closes the selector.

```js
api.selectBy(1); // Select next option in DOM sequence.
api.selectBy(-2); // Select the option that is two previous in DOM sequence.
```

**toggle(optionValue: string, opt_select: boolean|undefined)**
Toggles the option with the given `optionValue` to be selected or deselected based on `opt_select`. If `opt_select` is not present, then the option will be selected if currently not selected, and deselected if currently selected.

```js
api.toggle("a"); // Toggle the item with the attribute `option="a"`.
api.toggle("1", true); // Select the item with the attribute `option="1"`.
```

##### Events

The `amp-selector` API allows you to register and respond to the following events:

**select**

This event is triggered when the user selects an option.
Multi-selectors and single-selectors fire this when selecting or unselecting options.
Tapping disabled options does not trigger the `select` event.

<ul>
  <li>
  `event.data.targetOption` contains the `option` attribute value of the selected element.</li>
  <li>
  `event.data.selectedOptions` contains an array of the `option` attribute values of all selected elements.
  </li>
</ul>

```js
selector.addEventListener("select", (e) => console.log(e.data.targetOption))
```

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-selector-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

### Clearing selections

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

This attribute can be configured to use different
options based on a [media query](./../../spec/amp-html-responsive-attributes.md).

### Attributes on `<amp-selector>` options

#### option

Indicates that the option is selectable. If a value is specified, the contents of the value is submitted with the form.

#### disabled, selected

The attributes above behave the same way as they do on a standard HTML [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option) element.

## Events

Events may trigger actions on other AMP components using the `on` attribute.
e.g. `on="select: my-tab.show"`

Read more about [AMP Actions and Events](../../spec/amp-actions-and-events.md).

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
