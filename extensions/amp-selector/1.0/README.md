# Bento Selector

An input that presents any type of content as list of options. The contents of the options aren't just limited to text. It can be configured to allow the user to select only one, or multiple options.

## Web Component

You must include each Bento component's required CSS library before adding custom styles in order to guarantee proper loading. Or use the lightweight pre-uprgrade styles available inline. See [Layout and Style](#layout-and-style)

### Import via npm

```sh
npm install @bentoproject/selector
```

```javascript
import {defineElement as defineBentoSelector} from '@bentoproject/selector';
defineBentoSelector();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-selector-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-selector-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-selector-1.0.css" crossorigin="anonymous">
```

### Example

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-selector-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-selector-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-selector-1.0.css"
    />
  </head>
  <body>
    <bento-selector class="sample-selector">
      <ul>
        <li option="1">Option 1</li>
        <li option="2">Option 2</li>
        <li option="3">Option 3</li>
        <li option="4">Option 4</li>
      </ul>
    </bento-selector>
  </body>
</html>
```

### Usage notes

-   A `bento-selector` can contain any arbitrary HTML elements or Bento components (e.g., `bento-carousel`, etc.).
-   A `bento-selector` cannot contain any nested `bento-selector` controls.
-   Selectable options can be set by adding the `option` attribute to the element and assigning a value to the attribute (e.g., `<li option="value"></li>`).
-   Disabled options can be set by adding the `disabled` attribute to the element (e.g., `<li option="d" disabled></li>`).
-   Preselected options can be set by adding the `selected` attribute to the element (e.g., `<li option="b" selected></li>`).
-   To allow for multiple selections, add the `multiple` attribute to the `bento-selector` element. By default, the `bento-selector` allows for one selection at a time.
-   To disable the entire `bento-selector`, add the `disabled` attribute to the `bento-selector` element.
-   When an `bento-selector` contains a `name` attribute and the `bento-selector` is inside a `form` tag, if a submit event occurs on the form, the `bento-selector`behaves like a radio-button/checkbox group and submits the selected values (the ones assigned to the option) against the name of the `bento-selector`.

### Layout and Style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

You may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-selector {
    display: block;
  }
</style>
```

### Attributes on `<bento-selector>`

#### disabled, form, multiple, name

The attributes above behave the same way as they do on a standard HTML [`<select>`](https://developer.mozilla.org/en/docs/Web/HTML/Element/select) element.

#### keyboard-select-mode

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

### Attributes on option elements

#### option (required)

Indicates that the option is selectable. If a value is specified, the contents of the value is submitted with the form.

#### disabled, selected

The attributes above behave the same way as they do on a standard HTML [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option) element.

### Actions

The `bento-selector` API allows you to perform the following actions:

#### selectBy(delta: number)

Closes the selector.

```js
api.selectBy(1); // Select next option in DOM sequence.
api.selectBy(-2); // Select the option that is two previous in DOM sequence.
```

#### toggle(optionValue: string, opt_select: boolean|undefined)

Toggles the option with the given `optionValue` to be selected or deselected based on `opt_select`. If `opt_select` is not present, then the option will be selected if currently not selected, and deselected if currently selected.

```js
api.toggle('a'); // Toggle the item with the attribute `option="a"`.
api.toggle('1', true); // Select the item with the attribute `option="1"`.
```

### Events

The `bento-selector` API allows you to register and respond to the following events:

#### select

This event is triggered when the user selects an option. Multi-selectors and single-selectors fire this when selecting or unselecting options. Tapping disabled options does not trigger the `select` event.

<ul>
  <li>
  `event.data.targetOption` contains the `option` attribute value of the selected element.</li>
  <li>
  `event.data.selectedOptions` contains an array of the `option` attribute values of all selected elements.
  </li>
</ul>

```js
selector.addEventListener('select', (e) => console.log(e.data.targetOption));
```

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/selector
```

```javascript
import React from 'react';
import {
  BentoSelector,
  BentoSelectorOption,
} from '@bentoproject/selector/react';
import '@bentoproject/selector/styles.css';

function App() {
  return (
    <BentoSelector>
      <BentoSelectorOption option="1">Option 1</BentoSelectorOption>
      <BentoSelectorOption option="2">Option 2</BentoSelectorOption>
      <BentoSelectorOption option="3">Option 3</BentoSelectorOption>
      <BentoSelectorOption option="4">Option 4</BentoSelectorOption>
    </BentoSelector>
  );
}
```

### Layout and Style

#### Container type

The `BentoSelector` component can be styled with standard CSS.

The `width` and `height` of the `BentoSelector` may both be set in order to adjust the default size of the component. To ensure the component renders how you want it to, be sure to apply a size to the component. These can be applied inline:

```jsx
<BentoSelector style={{width: 100, height: 400}}>
  <BentoSelectorOption option="1">Option 1</BentoSelectorOption>
</BentoSelector>
```

Or via `className`:

```jsx
<BentoSelector className="custom-styles">
  <BentoSelectorOption option="1">Option 1</BentoSelectorOption>
</BentoSelector>
```

```css
.custom-styles {
  width: 100px;
  height: 400px;
}
```

### Props for `<BentoSelector>`

#### disabled, form, multiple, name

The attributes above behave the same way as they do on a standard HTML [`<select>`](https://developer.mozilla.org/en/docs/Web/HTML/Element/select) element.

#### keyboardSelectMode

The `keyboardSelectMode` attribute dictates the keyboard navigation behavior for options inside `<BentoSelector>`.

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

### Props for `<BentoSelectorOption>`

#### option

Indicates that the option is selectable. If a value is specified, the contents of the value is submitted with the form.

#### disabled, selected

The attributes above behave the same way as they do on a standard HTML [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option) element.

### Interactivity and API usage

Bento components are highly interactive through their API. The `BentoSelector` component API is accessible by passing a `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoSelector ref={ref}>
      <BentoSelectorOption option="1">Option 1</BentoSelectorOption>
      <BentoSelectorOption option="2">Option 2</BentoSelectorOption>
      <BentoSelectorOption option="3">Option 3</BentoSelectorOption>
      <BentoSelectorOption option="4">Option 4</BentoSelectorOption>
    </BentoSelector>
  );
}
```

### Actions

The `BentoSelector` API allows you to perform the following actions:

#### selectBy(delta: number)

Closes the selector.

```js
ref.current.selectBy(1); // Select next option in DOM sequence.
ref.current.selectBy(-2); // Select the option that is two previous in DOM sequence.
```

#### toggle(optionValue: string, opt_select: boolean|undefined)

Toggles the option with the given `optionValue` to be selected or deselected based on `opt_select`. If `opt_select` is not present, then the option will be selected if currently not selected, and deselected if currently selected.

```js
ref.current.toggle('1'); // Toggle the item with the attribute `option="1"`.
ref.current.toggle('2', true); // Select the item with the attribute `option="2"`.
```

### Events

`BentoSelector` API allows you to register and respond to the following events:

#### onChange

This event is triggered when a selector option is selected or deselected. The `onChange` prop gives you two key options:

-   `option` which returns the value of the `option` prop of the `BentoSelectorOption` which was selected or deselected.
-   `value` which returns an array of which `BentoSelectorOptions` are currently selected in the order they were selected.

```jsx
<BentoSelector
  as="ul"
  multiple
  onChange={({option, value}) => console.log(option, value)}
>
  <BentoSelectorOption as="li" option="1">
    Option 1
  </BentoSelectorOption>
  <BentoSelectorOption as="li" option="2">
    Option 2
  </BentoSelectorOption>
</BentoSelector>
```
