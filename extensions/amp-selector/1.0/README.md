# Bento Selector

## Usage

The Bento Selector is a control that presents a list of options and lets the user choose one or many options; the contents of the options aren't just limited to text. It can be used as a web component[`<bento-selector>`](#web-component), or as a Preact/React functional component [`<BentoSelector>`](#preactreact-component).

### Web Component

You must include each Bento component's required CSS library before adding custom styles in order to guarantee proper loading. Or use the lightweight pre-uprgrade styles available inline. See [Layout and Style](#layout-and-style)

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-selector
```

```javascript
import '@ampproject/bento-selector';
```

[/example]

#### Example: Include via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-selector {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script async src="https://cdn.ampproject.org/v0/bento-selector-1.0.js"></script>
  <style>
    bento-selector{
      width: 375px;
      height: 472px;
    }
  </style>
</head>

<bento-selector class="sample-selector" layout="container">
  <bento-selector-option option="1">Option 1</bento-selector-option>
  <bento-selector-option option="2">Option 2</bento-selector-option>
  <bento-selector-option option="3">Option 3</bento-selector-option>
  <bento-selector-option option="4">Option 4</bento-selector-option>
</bento-selector
```

[/example]

#### Usage notes

-   An `bento-selector` can contain any arbitrary HTML elements or AMP components (e.g., `bento-carousel`, etc.).
-   An `bento-selector` cannot contain any nested `bento-selector` controls.
-   Selectable options can be set by adding the `option` attribute to the element and assigning a value to the attribute (e.g., `<li option="value"></li>`).
-   Disabled options can be set by adding the `disabled` attribute to the element (e.g., `<li option="d" disabled></li>`).
-   Preselected options can be set by adding the `selected` attribute to the element (e.g., `<li option="b" selected></li>`).
-   To allow for multiple selections, add the `multiple` attribute to the `bento-selector` element. By default, the `bento-selector` allows for one selection at a time.
-   To disable the entire `bento-selector`, add the `disabled` attribute to the `bento-selector` element.
-   When an `bento-selector` contains a `name` attribute and the `bento-selector` is inside a `form` tag, if a submit event occurs on the form, the `bento-selector`behaves like a radio-button/checkbox group and submits the selected values (the ones assigned to the option) against the name of the `bento-selector`.

#### Layout and Style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

You may also make the light-weight pre-upgrade styles available inline:

```html
<style data-bento-boilerplate>
  bento-selector{
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Attributes on `<bento-selector>`

**disabled, form, multiple, name**

The attributes above behave the same way as they do on a standard HTML [`<select>`](https://developer.mozilla.org/en/docs/Web/HTML/Element/select) element.

**keyboard-select-mode**

The `keyboard-select-mode` attribute dictates the keyboard navigation behavior for options inside `<bento-selector>`.

<ul>
  <li>
    `none` (default): The tab key changes focus between items in the `<bento-selector>`. The user must press enter or space to change the selection. Arrow keys are disabled.
  </li>
  <li>
    `focus`: Tab key gives focus to `<bento-selector>`. The user navigates between items with the arrow keys. Must press space or enter to change the selection.
  </li>
  <li>
    `select`: Tab key gives focus to `<bento-selector>`. The selection changes as the user navigates options with arrow keys.
  </li>
</ul>

#### Attributes on `<bento-selector-option>`

**option**

Indicates that the option is selectable. If a value is specified, the contents of the value is submitted with the form.

**disabled, selected**

The attributes above behave the same way as they do on a standard HTML [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option) element.

#### Actions

The `bento-selector` API allows you to perform the following actions:

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

#### Events

The `bento-selector` API allows you to register and respond to the following events:

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

### Preact/React Component

The examples below demonstrate use of the `<BentoSelector>` as a functional component usable with the Preact or React libraries.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-selector
```

```javascript
import React from 'react';
import { BentoSelector, BentoSelectorOption} from '@ampproject/bento-selector/react';
import '@ampproject/bento-selector/styles.css';

function App() {
  return (
    <BentoSelector aria-label="Option menu">
      <BentoSelectorOption option="1">Option 1</BentoSelectorOption>
      <BentoSelectorOption option="2">Option 2</BentoSelectorOption>
      <BentoSelectorOption option="3">Option 3</BentoSelectorOption>
      <BentoSelectorOption option="4">Option 4</BentoSelectorOption>
    </BentoSelector>
  );
}
```

[/example]

#### Layout and Style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-facebook-1.0.css">
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style data-bento-boilerplate>
 BentoSelector{
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Attributes on `<BentoSelector>`

**disabled, form, multiple, name**

The attributes above behave the same way as they do on a standard HTML [`<select>`](https://developer.mozilla.org/en/docs/Web/HTML/Element/select) element.

**keyboard-select-mode**

The `keyboard-select-mode` attribute dictates the keyboard navigation behavior for options inside `<BentoSelector>`.

<ul>
  <li>
    `none` (default): The tab key changes focus between items in the `<BentoSelector>`. The user must press enter or space to change the selection. Arrow keys are disabled.
  </li>
  <li>
    `focus`: Tab key gives focus to `<BentoSelector>`. The user navigates between items with the arrow keys. Must press space or enter to change the selection.
  </li>
  <li>
    `select`: Tab key gives focus to `<BentoSelector>`. The selection changes as the user navigates options with arrow keys.
  </li>
</ul>

#### Attributes on `<BentoSelectorOption>`

**option**

Indicates that the option is selectable. If a value is specified, the contents of the value is submitted with the form.

**disabled, selected**

The attributes above behave the same way as they do on a standard HTML [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option) element.

#### Actions

The `BentoSelector` API allows you to perform the following actions:

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

#### Events

The `BentoSelector` API allows you to register and respond to the following events:

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
