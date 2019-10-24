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

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A horizontal navigation bar containing a set of menu items that, when activated via click, open/close corresponding containers underneath with additional content.</td>
  </tr>
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
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>TO BE ADDED</td>
  </tr>
</table>

## Overview
`<amp-mega-menu>` provides a way to organize and display large collections of navigational content at the top of an AMP page. The component is intended primarily for desktop and tablet use cases, and it can be used jointly with `<amp-sidebar>` to create a responsive menu.

## Behavior

A valid AMP page should have at most one `<amp-mega-menu>` component. The component should include a single `<nav>` element containing either `<ul>` or `<ol>`, under which each `<li>` element will be regarded as a menu item.

Each menu item should at the minimum contain an `<a>`, `<button>`, `<div>`, `<span>`, or one of the heading tags. Additionally, for an item to be expandable, its children must conform to the following specs:

1. A `<button>` or element with `role=button`: this element is used to toggle the expandable content (but only if the button has no `on` action) and receives focus when navigating between items;
2. A `<div>` with `role=dialog`: this element will be rendered as a container that holds additional content under an item, and its visibility is initially set to hidden;

Additionally, when an item is expanded, a mask will be applied on the rest of the body. For any contents that should appear above the mask (e.g. a title banner), place them along with `<amp-mega-menu>` inside a `<header>` element and add background color to all children of `<header>`.

`<amp-mega-menu>` may contain any of the following AMP elements:
- `<amp-ad>`
- `<amp-carousel>`
- `<amp-form>`
- `<amp-img>`
- `<amp-lightbox>`
- `<amp-list>`
- `<amp-video>`

In the example below, the mega menu contains two menu items with toggleable content, as well as a third item that is an external link.

[example playground="true" imports="amp-mega-menu"]
```html
<amp-mega-menu height="30" layout="fixed-height">
  <nav>
    <ul>
      <li>
        <span role="button">Image</span>
        <div role="dialog">
          <amp-img src="{{server_for_email}}/static/inline-examples/images/image1.jpg"
            width="450"
            height="300"></amp-img>
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

The content of a mega menu can be fetched dynamically from a CORS JSON endpoint using [amp-list](https://amp.dev/documentation/components/amp-list/) and rendered via [amp-mustache template](https://amp.dev/documentation/components/amp-mustache).

In the following example, content of the mega menu is rendered dynamically by nesting an `<amp-list>` directly inside the component.

[example playground="true" imports="amp-mega-menu,amp-list" template="amp-mustache"]
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

Note that the `<nav>` element must be parented by either the `<amp-mega-menu>` component itself or a `<template>`.

### Responsive design with `<amp-sidebar>`

For viewports that may be too narrow to display the menu items in one row, we recommend using an [amp-sidebar](https://amp.dev/documentation/components/amp-sidebar/) instead and responsively switch between the two components via media query.

The following sample demonstrates how to hide the mega menu when viewport width is less than `960px` and instead show a button to open the sidebar.

```html
<head>
  ...
  <style amp-custom>
    @media (max-width: 959px) {
      #mega-menu {
        display: none;
      }
    }
    @media (min-width: 960px) {
      .sidebar-open-btn {
        display: none;
      }
    }
  </style>
  ...
</head>
```
```html
<body>
  <header>
    <amp-mega-menu id="mega-menu" height="50" layout="fixed-height">
      <nav>
      ... <!-- list of menu items here -->
      </nav>
    </amp-mega-menu>
    <button class="sidebar-open-btn" on="tap:sidebar"></button>
  </header>
  <amp-sidebar id="sidebar" layout="nodisplay">
    ... <!-- list of menu items here -->
  </amp-sidebar>
  ...
</body>
```

## Accessibility

`<amp-mega-menu>` assigns the following ARIA attributes on the children of each expandable menu item; these attributes are used by screen reader technology to associate a button with its togglable container as well as to trap focus inside the container once opened.

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

## Validation
See [amp-mega-menu rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-mega-menu/validator-amp-mega-menu.protoascii) in the AMP validator specification.
