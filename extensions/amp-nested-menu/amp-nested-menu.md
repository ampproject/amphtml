---
$category@: layout
formats:
  - websites
teaser:
  text: Displays a drilldown menu with arbitrary levels of nested submenus.
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

# `amp-nested-menu`

Drilldown menu component with items that open nested submenus on tap.

<table>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://amp.dev/documentation/guides-and-tutorials/learn/experimental">Experimental</a>; activated by the <code>amp-nested-menu</code> experiment.</div></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><div>None (<code>amp-sidebar</code> lazy loads the component)</div></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill</td>
  </tr>
</table>

## Overview

`<amp-nested-menu>` enables layered content organization within [`<amp-sidebar>`](../amp-sidebar/0.1/amp-sidebar.md). A sidebar with `<amp-nested-menu>` can be used jointly with [`<amp-mega-menu>`](../amp-mega-menu/amp-mega-menu.md) to create a responsive menu.

## Usage

The `<amp-nested-menu>` component must be placed inside `<amp-sidebar>`. The component may contain the following AMP elements:

- [`<amp-img>`](../../builtins/amp-img.md)
- [`<amp-list>`](../amp-list/amp-list.md)
- [`<amp-accordion>`](../amp-accordion/amp-accordion.md)

### Nested submenus

`<amp-nested-menu>` supports nesting one or more layers of submenus. It uses the following attributes on its descendants as identifiers for the submenu functionality:

- `amp-nested-submenu`: this identifies a hidden submenu container. When opened, the element slides in and takes the place of its parent menu (either `<amp-nested-menu>` or another submenu).
- `amp-nested-submenu-open`: this identifies an element that opens a submenu on tap. It must be a sibling of the said submenu.
- `amp-nested-submenu-close`: this identifies an element that closes the closest containing submenu. The element must be the descendant of a submenu.

Only `<div>` tags may receive the `amp-nested-submenu` attribute. The submenu open/close attributes can be applied to any of the tags below:

- `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
- `<button>`
- `<span>`
- `<div>`

The following example demonstrates an `<amp-nested-menu>` with two levels of nested submenus.

[example playground="true" preview="top-frame" imports="amp-sidebar"]

```html
<button on="tap:sidebar1">Open Sidebar</button>
<amp-sidebar id="sidebar1" layout="nodisplay" style="width:300px">
  <amp-nested-menu layout="fill">
    <ul>
      <li>
        <h4 amp-nested-submenu-open>Open Sub-Menu</h4>
        <div amp-nested-submenu>
          <ul>
            <li>
              <h4 amp-nested-submenu-close>go back</h4>
            </li>
            <li>
              <h4 amp-nested-submenu-open>Open Another Sub-Menu</h4>
              <div amp-nested-submenu>
                <h4 amp-nested-submenu-close>go back</h4>
                <amp-img
                  src="{{server_for_email}}/static/inline-examples/images/image1.jpg"
                  layout="responsive"
                  width="450"
                  height="300"
                ></amp-img>
              </div>
            </li>
          </ul>
        </div>
      </li>
      <li>
        <a href="https://amp.dev/">Link</a>
      </li>
    </ul>
  </amp-nested-menu>
</amp-sidebar>
```

[/example]

### Dynamic content rendering

Fetch content of `<amp-nested-menu>` dynamically from a JSON endpoint using [`<amp-list>`](../amp-list/amp-list.md) and [`amp-mustache`](../amp-mustache/amp-mustache.md) template.

The example below demonstrates this ability by nesting `<amp-nested-menu>` inside `<amp-list>`.

[example playground="true" preview="top-frame" imports="amp-sidebar,amp-list" template="amp-mustache"]

```html
<button on="tap:sidebar2">Open Sidebar</button>
<amp-sidebar id="sidebar2" layout="nodisplay" style="width:300px">
  <amp-list
    layout="fill"
    src="{{server_for_email}}/static/inline-examples/data/amp-list-data.json"
    items="."
    single-item
  >
    <template type="amp-mustache">
      <amp-nested-menu layout="fill">
        <ul>
          {{#items}}
          <li>
            <h3 amp-nested-submenu-open>{{title}}</h3>
            <div amp-nested-submenu>
              <button amp-nested-submenu-close>close</button>
              <amp-img
                src="{{imageUrl}}"
                layout="responsive"
                width="400"
                height="300"
              ></amp-img>
            </div>
          </li>
          {{/items}}
        </ul>
      </nav>
    </template>
  </amp-list>
</amp-sidebar>
```

[/example]

Here is the JSON file used:

```json
{
  "items": [
    {
      "title": "Image 01",
      "imageUrl": "https://preview.amp.dev/static/inline-examples/images/flowers.jpg"
    },
    {
      "title": "Image 02",
      "imageUrl": "https://preview.amp.dev/static/inline-examples/images/sunset.jpg"
    }
  ]
}
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>side (optional)</strong></td>
    <td>Optional attribute that indicates from which side the submenus open from, either `left` or `right`. Set to `right` by default, or `left` if the document is RTL.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Actions

<table>
  <tr>
    <td width="40%"><strong><code>reset</code></strong></td>
    <td>Closes any open submenus and returns to the root menu. Use this in conjunction with sidebar's <code>sidebarClose</code> event to reset the menu after sidebar is closed.</td>
  </tr>
</table>

## Styling

The `<amp-nested-menu>` component can be styled with standard CSS.

## Accessibility

`<amp-nested-menu>` assigns `role=button` and `tabindex=0` on each submenu open/close element. When a submenu opens, focus shifts to the submenu close element inside it. When the submenu closes, focus shifts back to the submenu open element that opened it.

[tip type="note"]
Wrap every menu item in a `li` element to improve accessibility and keyboard support.
[/tip]

The component supports arrow key navigation as follows:

- `LEFT`: if a submenu is open, close it and return to the parent menu.
- `RIGHT`: if a submenu open element has focus, open the corresponding submenu.
- `UP/DOWN`: shift focus between items within a menu (this works only if all menu items are wrapped inside `li` elements under the same list).
- `END/HOME`: shift focus to the first/last item within a menu (similar to `UP/DOWN`)

If `side=left`, then the functionalities of `LEFT` and `RIGHT` arrow keys are reversed.

## Validation

See [amp-nested-menu rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-nested-menu/validator-amp-nested-menu.protoascii) in the AMP validator specification.
