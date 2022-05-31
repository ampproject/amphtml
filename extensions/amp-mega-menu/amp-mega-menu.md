---
$category@: layout
formats:
  - websites
teaser:
  text: Displays top-level navigational content inside expandable containers.
experimental: true
---

# amp-mega-menu

## Usage

Displays a horizontal navigation bar with menu items that open/close content containers on click.

`<amp-mega-menu>` provides a way to organize and display large collections of navigational content at the top of an AMP page. The component is intended primarily for desktop and tablet use cases, and it can be used jointly with [`<amp-sidebar>`](../amp-sidebar/0.1/amp-sidebar.md) to create a responsive menu.

The `<amp-mega-menu>` component includes a single `<nav>` element containing either a `<ul>` or `<ol>`, where each `<li>` element is a menu item.

[tip type="note"]
The `<nav>` element must be parented by either the `<amp-mega-menu>` component or a `<template>`, and it must have `<ul>` or `<ol>` as its only child.
[/tip]

Each menu item can contain any of the following tags as direct children:

-   `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
-   `<a>`
-   `<button>`
-   `<span>`
-   `<div>`

### Toggleable dropdowns

A menu item should have either one child (e.g. an anchor link or element with tap action), or two if the item expands into a dropdown container. In the latter case, the two children must conform to the following specs:

1. A `<button>` or element with `role=button`: this element is used to toggle the dropdown container (but only if the former has no registered tap action) and receives focus when navigating between items.
2. A `<div>` with `role=dialog`: this element will be rendered as a container that holds additional content under an item, and it is initially hidden.

A mask will cover the rest of the page when a dropdown is open. Content, such as a title banner, can appear above the mask. Apply a background color on the content and place it, alongside the `<amp-mega-menu>`, inside a `<header>` element.

Each dropdown may contain any of the following AMP elements:

-   `<amp-ad>`
-   `<amp-carousel>`
-   `<amp-form>`
-   `<amp-img>`
-   `<amp-lightbox>`
-   `<amp-list>`
-   `<amp-video>`

The example below demonstrates an `<amp-mega-menu>` with three menu items. The first two are toggleable and the third is an external link.

[example playground="true" preview="top-frame" orientation="landscape" imports="amp-mega-menu"]

```html
<amp-mega-menu height="30" layout="fixed-height">
  <nav>
    <ul>
      <li>
        <span role="button">Image</span>
        <div role="dialog">
          <amp-img
            src="{{server_for_email}}/static/inline-examples/images/image1.jpg"
            width="300"
            height="200"
          ></amp-img>
        </div>
      </li>
      <li>
        <span role="button">List</span>
        <div role="dialog">
          <ol>
            <li>item 1</li>
            <li>item 2</li>
            <li>item 3</li>
          </ol>
        </div>
      </li>
      <li>
        <a href="https://amp.dev/">Link</a>
      </li>
    </ul>
  </nav>
</amp-mega-menu>
```

[/example]

### Dynamic content rendering

Fetch content of `<amp-mega-menu>` dynamically from a JSON endpoint using [`<amp-list>`](../amp-list/amp-list.md) and [`<amp-mustache>`](../amp-mustache/amp-mustache.md) template.

The example below demonstrates this ability by nesting `<amp-list>` inside `<amp-mega-menu>`.

[example playground="true" preview="top-frame" orientation="landscape" imports="amp-mega-menu,amp-list" template="amp-mustache"]

```html
<amp-mega-menu height="60" layout="fixed-height">
  <amp-list
    height="350"
    layout="fixed-height"
    src="{{server_for_email}}/static/samples/json/product-single-item.json"
    single-item
  >
    <template type="amp-mustache">
      <nav>
        <ul>
          {{#values}}
          <li>
            <h4 role="button">{{name}}</h4>
            <div role="dialog">
              <amp-img
                src="{{server_for_email}}{{img}}"
                width="320"
                height="213"
              ></amp-img>
              <p>Price: $<b>{{price}}</b></p>
            </div>
          </li>
          {{/values}}
        </ul>
      </nav>
    </template>
  </amp-list>
</amp-mega-menu>
```

[/example]

Here is the JSON file used:

```json
{
  "items": [
    {
      "values": [
        {
          "id": 1,
          "img": "/static/samples/img/product1_640x426.jpg",
          "name": "Apple",
          "price": "1.99"
        },
        {
          "id": 2,
          "img": "/static/samples/img/product2_640x426.jpg",
          "name": "Orange",
          "price": "0.99"
        },
        {
          "id": 3,
          "img": "/static/samples/img/product3_640x426.jpg",
          "name": "Pear",
          "price": "1.50"
        }
      ]
    }
  ]
}
```

### Responsive design with `<amp-sidebar>`

Some viewports may be too narrow to display the content of `<amp-mega-menu>` in a single row. For these use cases, use media queries to switch between `<amp-mega-menu>` and `<amp-sidebar>`.

The example below hides `<amp-mega-menu>` when the viewport width is less than 500px. It replaces `<amp-mega-menu>` with a button that opens `<amp-sidebar>`.

[example playground="true" preview="top-frame"]

```html
<head>
  <script
    async
    custom-element="amp-mega-menu"
    src="https://cdn.ampproject.org/v0/amp-mega-menu-0.1.js"
  ></script>
  <script
    async
    custom-element="amp-sidebar"
    src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"
  ></script>
  <script
    async
    custom-element="amp-accordion"
    src="https://cdn.ampproject.org/v0/amp-accordion-0.1.js"
  ></script>
  <style amp-custom>
    .sidebar-open-btn {
      font-size: 2em;
      display: none;
    }
    @media (max-width: 500px) {
      #mega-menu {
        display: none;
      }
      .sidebar-open-btn {
        display: block;
      }
    }
  </style>
</head>
<body>
  <header>
    <amp-mega-menu id="mega-menu" height="50" layout="fixed-height">
      <nav>
        <ul>
          <!-- list of menu items here -->
          <li>
            <h4 role="button">menu item</h4>
            <div role="dialog">more content</div>
          </li>
        </ul>
      </nav>
    </amp-mega-menu>
    <button class="sidebar-open-btn" on="tap:sidebar">=</button>
  </header>
  <amp-sidebar id="sidebar" layout="nodisplay">
    <amp-accordion>
      <!-- list of menu items here -->
      <section>
        <h4>menu item</h4>
        <div>more content</div>
      </section>
    </amp-accordion>
  </amp-sidebar>
</body>
```

[/example]

## Attributes

### data-close-button-aria-label (optional)

Optional attribute used to set ARIA label for the close buttons added for accessibility.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Styling

The `<amp-mega-menu>` component can be styled with standard CSS.

-   The `<nav>` element and dropdown elements have a default white background.
-   When open, the dropdown containers will fill the entire viewport width. This can be overridden with the left and width properties.
-   Expanding a menu item applies the `open` attribute to the `<amp-mega-menu>` component as well as the expanded `<li>` element.

The example below customizes:

-   The background color of the navigation bar.
-   The appearance of opened menu buttons.
-   The position of the dropdown containers.

[example playground="true" preview="top-frame" orientation="landscape"]

```html
<head>
  <script
    async
    custom-element="amp-mega-menu"
    src="https://cdn.ampproject.org/v0/amp-mega-menu-0.1.js"
  ></script>
  <style amp-custom>
    .title {
      background-color: lightblue;
      padding: 0.5em;
      margin: 0;
    }
    amp-mega-menu nav {
      background-color: lightgray;
    }
    amp-mega-menu .menu-item[open] > span {
      background-color: white;
    }
    amp-mega-menu .menu-item[open] > div {
      left: 10px;
      right: 10px;
      width: auto;
    }
  </style>
</head>
<body>
  <header>
    <h1 class="title">styling the amp-mega-menu</h1>
    <amp-mega-menu height="30" layout="fixed-height">
      <nav>
        <ul>
          <li class="menu-item">
            <span role="button">List 1</span>
            <div role="dialog">
              <ol>
                <li>item 1.1</li>
                <li>item 1.2</li>
                <li>item 1.3</li>
              </ol>
            </div>
          </li>
          <li class="menu-item">
            <span role="button">List 2</span>
            <div role="dialog">
              <ol>
                <li>item 2.1</li>
                <li>item 2.2</li>
                <li>item 2.3</li>
              </ol>
            </div>
          </li>
        </ul>
      </nav>
    </amp-mega-menu>
  </header>
</body>
```

[/example]

## Accessibility

`<amp-mega-menu>` assigns the following ARIA attributes on the children of each expandable menu item. Screen readers use these attributes to associate buttons with toggleable containers and trap focus inside opened containers.

```html
<li>
  <button aria-expanded aria-controls="unique_id" aria-haspopup="dialog">
    ...
  </button>
  <div role="dialog" aria-modal id="unique_id">
    ...
  </div>
</li>
```

In addition, to assist screen reader users, an invisible but tabbable close button is added to the start and end of each `role=dialog` element.

Keyboard support for the component includes:

-   Left/right arrow keys to navigate between menu items when focused.
-   Enter/Space keys to trigger an active menu item button.
-   Esc key to collapse the mega menu.

Open on hover is not currently supported by `<amp-mega-menu>` due to UX and accessibility concerns. In particular, we want to avoid scenarios where:

-   A user moves cursor over a button that toggles the dropdown menu and clicks, which immediately closes the dropdown after opening it on hover.
-   A user wants to click on an element below a closed dropdown but accidentally opens it on hover and clicks inside the dropdown instead.

More information on this topic can be found in the [Accessibility Developer Guide](https://www.accessibility-developer-guide.com/examples/widgets/dropdown/).

## Validation

See [amp-mega-menu rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-mega-menu/validator-amp-mega-menu.protoascii) in the AMP validator specification.
