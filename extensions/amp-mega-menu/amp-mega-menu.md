---
$category@: layout
formats:
  - websites
teaser:
  text: Displays top-level navigational content inside expandable containers.
experimental: true
---
<!--
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# `amp-mega-menu`

A horizontal navigation bar containing a set of menu items that, when activated via click, open/close corresponding containers underneath with additional content.

<table>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://amp.dev/documentation/guides-and-tutorials/learn/experimental">Experimental</a>; activated by the <code>amp-mega-menu</code> experiment.</div></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-mega-menu" src="https://cdn.ampproject.org/v0/amp-mega-menu-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fixed-height</td>
  </tr>
</table>

## Overview
`<amp-mega-menu>` provides a way to organize and display large collections of navigational content at the top of an AMP page. The component is intended primarily for desktop and tablet use cases, and it can be used jointly with `<amp-sidebar>` to create a responsive menu.

## Usage

The `<amp-mega-menu>` component should include a single `<nav>` element containing either `<ul>` or `<ol>`, under which each `<li>` element will be regarded as a menu item.

[tip type="note"]
For the component to validate, the `<nav>` element must be parented by either the `<amp-mega-menu>` component itself or a `<template>`, and it must have a `<ul>` or `<ol>` as its only child.
[/tip]

Each menu item can contain only `<a>`, `<button>`, `<div>`, `<span>`, or any heading tag as direct children. It should have either one child (e.g. an anchor link or element with tap action), or two if the menu item expands into a dropdown container. In the latter case, the two children must conform to the following specs:

1. A `<button>` or element with `role=button`: this element is used to toggle the dropdown container (but only if the former has no registered tap action) and receives focus when navigating between items.
2. A `<div>` with `role=dialog`: this element will be rendered as a container that holds additional content under an item, and its visibility is initially set to hidden.

Additionally, when an item is expanded, a mask will be applied on the rest of the body. For any contents that should appear above the mask (e.g. a title banner), place them along with `<amp-mega-menu>` inside a `<header>` element and add background color to all children of `<header>`.

`<amp-mega-menu>` may contain any of the following AMP elements:
- `<amp-ad>`
- `<amp-carousel>`
- `<amp-form>`
- `<amp-img>`
- `<amp-lightbox>`
- `<amp-list>`
- `<amp-video>`

In the example below, the `<amp-mega-menu>` contains two menu items with toggleable content, as well as a third item that is an external link.

[example playground="true" preview="top-frame" orientation="landscape" imports="amp-mega-menu"]
```html
<amp-mega-menu height="30" layout="fixed-height">
  <nav>
    <ul>
      <li>
        <span role="button">Image</span>
        <div role="dialog">
          <amp-img src="{{server_for_email}}/static/inline-examples/images/image1.jpg"
            width="300"
            height="200"></amp-img>
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

The content of a mega menu can be fetched dynamically from a CORS JSON endpoint using [amp-list](../amp-list/amp-list.md) and rendered via [amp-mustache template](../amp-mustache/amp-mustache.md).

In the following example, content of `<amp-mega-menu>` is rendered dynamically by nesting an `<amp-list>` directly inside the component.

[example playground="true" preview="top-frame" orientation="landscape" imports="amp-mega-menu,amp-list" template="amp-mustache"]
```html
<amp-mega-menu height="60" layout="fixed-height">
  <amp-list height="350" layout="fixed-height" src="{{server_for_email}}/static/samples/json/product-single-item.json" single-item>
    <template type="amp-mustache">
      <nav>
        <ul>
          {{#values}}
          <li>
            <h4 role="button">{{name}}</h4>
            <div role="dialog">
              <amp-img src="{{server_for_email}}{{img}}" width="320" height="213"></amp-img>
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

Here is the JSON file that we used:

```json
{
  "items": [{
    "values": [{
      "id": 1,
      "img": "/static/samples/img/product1_640x426.jpg",
      "name": "Apple",
      "price": "1.99"
    }, {
      "id": 2,
      "img": "/static/samples/img/product2_640x426.jpg",
      "name": "Orange",
      "price": "0.99"
    }, {
      "id": 3,
      "img": "/static/samples/img/product3_640x426.jpg",
      "name": "Pear",
      "price": "1.50"
    }]
  }]
}
```

### Responsive design with `<amp-sidebar>`

For viewports that may be too narrow to display the menu items in one row, we recommend using an `<amp-sidebar>` instead and responsively switch between the two components via media query.

The following example demonstrates how to hide the mega menu when viewport width is no more than `500px` and instead show a button to open the sidebar containing an accordion menu.

[example playground="true" preview="top-frame"]
```html
<head>
  <script async custom-element="amp-mega-menu" src="https://cdn.ampproject.org/v0/amp-mega-menu-0.1.js"></script>
  <script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>
  <script async custom-element="amp-accordion" src="https://cdn.ampproject.org/v0/amp-accordion-0.1.js"></script>
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

<table>
  <tr>
    <td width="40%"><strong>data-close-button-aria-label (optional)</strong></td>
    <td>Optional attribute used to set ARIA label for the close buttons added for accessibility.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Styling

The `<amp-mega-menu>` component can be styled with standard CSS.

- By default, a white background is applied to the `<nav>` element and the expandable content elements.
- When open, the content containers will fill the entire viewport width but can be overridden with the `left` and `width` properties.
- The current state of the mega menu is exposed via the `open` attribute that is set on the `amp-mega-menu` tag when one of the menu items is expanded.
- The `<li>` element with expanded content will also receive the `open` attribute, which developers can use to style its children.

In the example below, we will customize the background color of the navigation bar, the appearance of menu buttons when opened, as well as the positioning of dropdown containers.

[example playground="true" preview="top-frame" orientation="landscape"]
```html
<head>
  <script async custom-element="amp-mega-menu" src="https://cdn.ampproject.org/v0/amp-mega-menu-0.1.js"></script>
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

`<amp-mega-menu>` assigns the following ARIA attributes on the children of each expandable menu item. These attributes are used by screen reader technology to associate a button with its togglable container as well as to trap focus inside the container once opened.

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
- Left/right arrow keys to navigate between menu items when focused;
- Enter/Space keys to trigger an active menu item button;
- Esc key to collapse the mega menu;

Open on hover is not currently supported by `<amp-mega-menu>` due to UX and accessibility concerns. In particular, we want to avoid scenarios where:
- A user moves cursor over a button that toggles the dropdown menu and clicks, which immediately closes the dropdown after opening it on hover.
- A user wants to click on an element below a closed dropdown but accidentally opens it on hover and clicks inside the dropdown instead.

More information on this topic can be found in the [Accessibility Developer Guide](https://www.accessibility-developer-guide.com/examples/widgets/dropdown/).

## Validation
See [amp-mega-menu rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-mega-menu/validator-amp-mega-menu.protoascii) in the AMP validator specification.
