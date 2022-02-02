# Bento Sidebar

Provides a way to display meta content intended for temporary access such as navigation, links, buttons, menus. The sidebar can be revealed by a button tap while the main content remains visually underneath.

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css" crossorigin="anonymous">
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
      src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
    />
  </head>
  <body>
    <bento-sidebar id="sidebar1" side="right" hidden>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </bento-sidebar>

    <div class="buttons" style="margin-top: 8px">
      <button id="open-sidebar">Open sidebar</button>
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
</html>
```

### Interactivity and API usage

Bento components are highly interactive through their API. The `bento-sidebar` component API is accessible by including the following script tag in your document:

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### Actions

The `bento-sidebar` API allows you to perform the following actions:

##### open()

Opens the sidebar.

```javascript
api.open();
```

##### close()

Closes the sidebar.

```javascript
api.close();
```

##### toggle()

Toggles the sidebar open state.

```javascript
api.toggle(0);
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### Custom styles

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

### UX considerations

When using `<bento-sidebar>`, keep in mind that your users will often view your page on mobile, which may display a fixed-position header. In addition, browsers often display their own fixed header at the top of the page. Adding another fixed-position element at the top of the screen would take up a large amount of mobile screen space with content that gives the user no new information.

For this reason, we recommend that affordances to open the sidebar are not placed in a fixed, full-width header.

-   The sidebar can only appear on the left or right side of a page.
-   The max-height of the sidebar is 100vh, if the height exceeds 100vh then a vertical scrollbar appears. The default height is set to 100vh in CSS and is overridable in CSS.
-   The width of the sidebar can be set and adjusted using CSS.
-   `<bento-sidebar>` is _recommended_ to be be a direct child of the `<body>` to preserve a logical DOM order for accessibility as well as to avoid altering its behavior by a container element. Note that having an ancestor of `bento-sidebar` with a set `z-index` may cause the sidebar to appear below other elements (such as headers), breaking its functionality.

### Attributes

#### side

Indicates what side of the page the sidebar should open from, either `left` or `right`. If a `side` is not specified, the `side` value will be inherited from the `body` tag's `dir` attribute (`ltr` => `left` , `rtl` => `right`); if no `dir` exists, the `side` defaults to `left`.

#### open

This attribute is present when the sidebar is open.

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import React from 'react';
import {BentoSidebar} from '@bentoproject/sidebar/react';
import '@bentoproject/sidebar/styles.css';

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

### Interactivity and API usage

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

#### Actions

The `BentoSidebar` API allows you to perform the following actions:

##### open()

Opens the sidebar.

```javascript
ref.current.open();
```

##### close()

Closes the sidebar.

```javascript
ref.current.close();
```

##### toggle()

Toggles the sidebar open state.

```javascript
ref.current.toggle(0);
```

### Layout and style

The `BentoSidebar` component can be styled with standard CSS.

-   The `width` of the `bento-sidebar` may be set to adjust the width from the preset 45px value.
-   The height of the `bento-sidebar` may be set to adjust the height of the sidebar, if required. If the height exceeds 100vw, the sidebar will have a vertical scrollbar. The preset height of the sidebar is 100vw and can be overridden in CSS to make it shorter.

To ensure the component renders how you want it to, be sure to apply a size to the component. These can be applied inline:

```jsx
<BentoSidebar style={{width: 300, height: '100%'}}>
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
<BentoSidebar className="custom-styles">
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

### UX considerations

When using `<BentoSidebar>`, keep in mind that your users will often view your page on mobile, which may display a fixed-position header. In addition, browsers often display their own fixed header at the top of the page. Adding another fixed-position element at the top of the screen would take up a large amount of mobile screen space with content that gives the user no new information.

For this reason, we recommend that affordances to open the sidebar are not placed in a fixed, full-width header.

-   The sidebar can only appear on the left or right side of a page.
-   The max-height of the sidebar is 100vh, if the height exceeds 100vh then a vertical scrollbar appears. The default height is set to 100vh in CSS and is overridable in CSS.
-   The width of the sidebar can be set and adjusted using CSS.
-   `<BentoSidebar>` is _recommended_ to be be a direct child of the `<body>` to preserve a logical DOM order for accessibility as well as to avoid altering its behavior by a container element. Note that having an ancestor of `BentoSidebar` with a set `z-index` may cause the sidebar to appear below other elements (such as headers), breaking its functionality.

### Props

#### side

Indicates what side of the page the sidebar should open from, either `left` or `right`. If a `side` is not specified, the `side` value will be inherited from the `body` tag's `dir` attribute (`ltr` => `left` , `rtl` => `right`); if no `dir` exists, the `side` defaults to `left`.
