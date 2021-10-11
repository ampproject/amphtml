# Bento Sidebar

## Usage

The Bento Sidebar provides a way to display meta content intended for temporary access such as navigation, links, buttons, menus. The sidebar can be revealed by a button tap while the main content remains visually underneath.

Use Bento Sidebar as a web component [`<bento-sidebar>`](#web-component), or a Preact/React functional component [`<BentoSidebar>`](#preactreact-component).

### Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

The examples below demonstrate use of the `<bento-sidebar>` web component.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-sidebar
```

```javascript
import '@ampproject/bento-sidebar';
```

[/example]

#### Example: Include via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-sidebar:not([open]) {
      display: none !important;
    }
  </style>
  <script async src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.js"></script>
</head>
<body>
  <bento-sidebar id="sidebar1" side="right">
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
  </bento-sidebar>

  <div class="buttons" style="margin-top: 8px;">
    <button id="open-sidebar">
      Open sidebar
    </button>
  </div>

  <script>
    (async () => {
      const sidebar = document.querySelector('#sidebar1');
      await customElements.whenDefined('bento-sidebar');
      const api = await sidebar.getApi();

      // set up button actions
      document.querySelector('#open-sidebar').onclick = () => api.open();
    })();
  </script>
</body>
```

[/example]

#### Bento Toolbar

You can create a Bento Toolbar element that displays in the `<body>` by specifying the `toolbar` attribute with a media query and a `toolbar-target` attribute with an element id on a `<nav>` element that is a child of `<bento-sidebar>`. The `toolbar` duplicates the `<nav>` element and its children and appends the element into the `toolbar-target` element.

##### Behavior

-   The sidebar may implement toolbars by adding nav elements with the `toolbar` attribute and `toolbar-target` attribute.
-   The nav element must be a child of `<bento-sidebar>` and follow this format: `<nav toolbar="(media-query)" toolbar-target="elementID">`.
    -   For instance, this would be a valid use of toolbar: `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`.
-   Toolbar behavior is only applied while the `toolbar` attribute media-query is valid. Also, an element with the `toolbar-target` attribute id must exist on the page for the toolbar to be applied.

###### Example: Basic Toolbar

In the following example, we display a `toolbar` if the window width is less than or equal to 767px. The `toolbar` contains a search input element. The `toolbar` element will be appended to the `<div id="target-element">` element.

```html
<bento-sidebar id="sidebar1" side="right">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>

  <nav toolbar="(max-width: 767px)" toolbar-target="target-element">
    <ul>
      <li>
        <input placeholder="Search..." />
      </li>
    </ul>
  </nav>
</bento-sidebar>

<div id="target-element"></div>
```

#### Interactivity and API usage

Bento enabled components used as a standalone web component are highly interactive through their API. The `bento-sidebar` component API is accessible by including the following script tag in your document:

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

##### Actions

The `bento-sidebar` API allows you to perform the following actions:

**open()**
Opens the sidebar.

```javascript
api.open();
```

**close()**
Closes the sidebar.

```javascript
api.close();
```

**toggle()**
Toggles the sidebar open state.

```javascript
api.toggle(0);
```

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-sidebar-1.0.css">
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style data-bento-boilerplate>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

##### Custom styles

The `bento-sidebar` component can be styled with standard CSS.

-   The `width` of the `bento-sidebar` may be set to adjust the width from the pre-set 45px value.
-   The height of the `bento-sidebar` may be set to adjust the height of the sidebar, if required. If the height exceeds 100vw, the sidebar will have a vertical scrollbar. The preset height of the sidebar is 100vw and can be overridden in CSS to make it shorter.
-   The current state of the sidebar is exposed via the `open` attribute that is set on the `bento-sidebar` tag when the side bar is open on the page.

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

#### UX considerations

When using `<bento-sidebar>`, keep in mind that your users will often view your page on mobile, which may display a fixed-position header. In addition, browsers often display their own fixed header at the top of the page. Adding another fixed-position element at the top of the screen would take up a large amount of mobile screen space with content that gives the user no new information.

For this reason, we recommend that affordances to open the sidebar are not placed in a fixed, full-width header.

-   The sidebar can only appear on the left or right side of a page.
-   The max-height of the sidebar is 100vh, if the height exceeds 100vh then a vertical scrollbar appears. The default height is set to 100vh in CSS and is overridable in CSS.
-   The width of the sidebar can be set and adjusted using CSS.
-   `<bento-sidebar>` is _recommended_ to be be a direct child of the `<body>` to preserve a logical DOM order for accessibility as well as to avoid altering its behavior by a container element. Note that having an ancestor of `bento-sidebar` with a set `z-index` may cause the sidebar to appear below other elements (such as headers), breaking its functionality.

#### Attributes

##### side

Indicates what side of the page the sidebar should open from, either `left` or `right`. If a `side` is not specified, the `side` value will be inherited from the `body` tag's `dir` attribute (`ltr` => `left` , `rtl` => `right`); if no `dir` exists, the `side` defaults to `left`.

##### open

This attribute is present when the sidebar is open.

##### toolbar

This attribute is present on child `<nav toolbar="(media-query)" toolbar-target="elementID">` elements, and accepts a media query of when to show a toolbar. See the [Toolbar](#bento-toolbar) section for more information on using toolbars.

##### toolbar-target

This attribute is present on child `<nav toolbar="(media-query)" toolbar-target="elementID">`, and accepts an id of an element on the page. The `toolbar-target` attribute will place the toolbar into the specified id of the element on the page, without the default toolbar styling. See the [Toolbar](#bento-toolbar) section for more information on using toolbars.

### Preact/React Component

The examples below demonstrate use of the `<BentoSidebar>` as a functional component usable with the Preact or React libraries.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-sidebar
```

```javascript
import React from 'react';
import { BentoSidebar } from '@ampproject/bento-sidebar/react';
import '@ampproject/bento-sidebar/styles.css';

function App() {
  return (
    <BentoSidebar>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

[/example]

#### Bento Toolbar

You can create a Bento Toolbar element that displays in the `<body>` by specifying the `toolbar` prop with a media query and a `toolbarTarget` prop with an element id on a `<BentoSidebarToolbar>` component that is a child of `<BentoSidebar>`. The `toolbar` duplicates the `<BentoSidebarToolbar>` element and its children and appends the element into the `toolbarTarget` element.

##### Behavior

-   The sidebar may implement toolbars by adding nav elements with the `toolbar` prop and `toolbarTarget` prop.
-   The nav element must be a child of `<BentoSidebar>` and follow this format: `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`.
    -   For instance, this would be a valid use of toolbar: `<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`.
-   Toolbar behavior is only applied while the `toolbar` prop media-query is valid. Also, an element with the `toolbarTarget` prop id must exist on the page for the toolbar to be applied.

###### Example: Basic Toolbar

In the following example, we display a `toolbar` if the window width is less than or equal to 767px. The `toolbar` contains a search input element. The `toolbar` element will be appended to the `<div id="target-element">` element.

```jsx
<BentoSidebar>
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
  <BentoSidebarToolbar toolbar="(max-width: 767px)" toolbarTarget="toolbar-target">
    <ul>
      <li>Toolbar Item 1</li>
      <li>Toolbar Item 2</li>
    </ul>
  </BentoSidebarToolbar>
</BentoSidebar>

<div id="target-element"></div>
```

#### Interactivity and API usage

Bento components are highly interactive through their API. The `BentoSidebar` component API is accessible by passing a `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoSidebar ref={ref}>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

##### Actions

The `BentoSidebar` API allows you to perform the following actions:

**open()**
Opens the sidebar.

```javascript
ref.current..open();
```

**close()**
Closes the sidebar.

```javascript
ref.current..close();
```

**toggle()**
Toggles the sidebar open state.

```javascript
ref.current..toggle(0);
```

#### Layout and style

The `BentoSidebar` component can be styled with standard CSS.

-   The `width` of the `bento-sidebar` may be set to adjust the width from the preset 45px value.
-   The height of the `bento-sidebar` may be set to adjust the height of the sidebar, if required. If the height exceeds 100vw, the sidebar will have a vertical scrollbar. The preset height of the sidebar is 100vw and can be overridden in CSS to make it shorter.

To ensure the component renders how you want it to, be sure to apply a size to the component. These can be applied inline:

```jsx
<BentoSidebar style={{width: '300px', height: '100%'}}>
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

Or via `className`:

```jsx
<BentoSidebar className='custom-styles'>
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

```css
.custom-styles {
  height: 100%;
  width: 300px;
}
```

#### UX considerations

When using `<BentoSidebar>`, keep in mind that your users will often view your page on mobile, which may display a fixed-position header. In addition, browsers often display their own fixed header at the top of the page. Adding another fixed-position element at the top of the screen would take up a large amount of mobile screen space with content that gives the user no new information.

For this reason, we recommend that affordances to open the sidebar are not placed in a fixed, full-width header.

-   The sidebar can only appear on the left or right side of a page.
-   The max-height of the sidebar is 100vh, if the height exceeds 100vh then a vertical scrollbar appears. The default height is set to 100vh in CSS and is overridable in CSS.
-   The width of the sidebar can be set and adjusted using CSS.
-   `<BentoSidebar>` is _recommended_ to be be a direct child of the `<body>` to preserve a logical DOM order for accessibility as well as to avoid altering its behavior by a container element. Note that having an ancestor of `BentoSidebar` with a set `z-index` may cause the sidebar to appear below other elements (such as headers), breaking its functionality.

### Props

##### side

Indicates what side of the page the sidebar should open from, either `left` or `right`. If a `side` is not specified, the `side` value will be inherited from the `body` tag's `dir` attribute (`ltr` => `left` , `rtl` => `right`); if no `dir` exists, the `side` defaults to `left`.

##### toolbar

This prop is present on child `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` elements, and accepts a media query of when to show a toolbar. See the [Toolbar](#bento-toolbar) section for more information on using toolbars.

##### toolbarTarget

This attribute is present on child `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`, and accepts an id of an element on the page. The `toolbarTarget` prop will place the toolbar into the specified id of the element on the page, without the default toolbar styling. See the [Toolbar](#bento-toolbar) section for more information on using toolbars.
