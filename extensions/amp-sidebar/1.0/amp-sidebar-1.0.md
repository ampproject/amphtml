<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-sidebar"></a> `amp-sidebar`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>
    A sidebar provides a way to display meta content intended for temporary access (navigation links, buttons, menus, etc.).The sidebar can be revealed by a button tap while the main content remains visually underneath.
    However, optional attributes that accept media queries can be used to display meta content in other parts of the site. `dock` makes the sidebar always visible at a certain media query. Whereas, `<nav toolbar="">` allows
    for content within the sidebar to be displayed on other parts of the main content.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-1.0.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-sidebar/">amp-sidebar example</a>.</td>
  </tr>
</table>

## Behavior

- The `<amp-sidebar>` should be a direct child of the `<body>`.
- The sidebar can only appear on the left or right side of a page.
- The `<amp-sidebar>` may contain any valid HTML elements (supported by AMP).
- The `<amp-sidebar>` may contain any of the following AMP elements:
    - `<amp-accordion>`
    - `<amp-img>`
    - `<amp-fit-text>`
    - `<amp-list>`
    - `<amp-live-list>`
    - `<amp-social-share>`
- The max-height of the sidebar is 100vh, if the height exceeds 100vh then a vertical scrollbar appears. The default height is set to 100vh in CSS and is overridable in CSS.
- The width of the sidebar can be set and adjusted between 45px and 80vw using CSS.
- Touch zoom is disabled on the `amp-sidebar` and it's mask when the sidebar is open.

Example:

```html
<amp-sidebar id="sidebar1" layout="nodisplay" side="right">
  <ul>
    <li> Nav item 1</li>
    <li> Nav item 2</li>
    <li> Nav item 3</li>
    <li> Nav item 4</li>
    <li> Nav item 5</li>
    <li> Nav item 6</li>
  </ul>
</amp-sidebar>
```

### Opening and closing the sidebar

To toggle, open, or close the sidebar when an element is tapped or clicked, set the [`on`](../../spec/amp-actions-and-events.md) action attribute on the element, and specify one of the following action methods:

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>open (default)</td>
    <td>Opens the sidebar</td>
  </tr>
  <tr>
    <td>close</td>
    <td>Closes the sidebar</td>
  </tr>
  <tr>
    <td>toggle</td>
    <td>Toggles the sidebar state</td>
  </tr>
</table>

If the user taps back on the partially-visible main content area, this closes the sidebar.

Alternatively, pressing the escape key on the keyboard will also close the sidebar.

Example:

```html
<button class="hamburger" on='tap:sidebar1.toggle'></button>
<button on='tap:sidebar1'>Open</button>
<button on='tap:sidebar1.open'>Open</button>
<button on='tap:sidebar1.close'>x</button>
```

### Toolbar

Toolbar allows duplicating items within the sidebar, into the `<body>`, if the window matches a certain media query

#### Behavior

- The sidebar may implement toolbars by adding nav elements with the toolbar attribute
- The nav element must be a child of `<amp-sidebar>` and follow this format: `<nav toolbar="(media-query)">`
    - For instance, this would be a valid use of toolbar: `<nav toolbar="(max-width: 1024px)">`
- The nav containing the toolbar attribute, must only contain a single `<ul>` element, that contains `<li>` elements
    - The `<li>` elements may may contain any valid HTML elements (supported by AMP), or any of the AMP elements that `<amp-sidebar>` supports.
- The nav element, or it's `<ul>`'s `<li>` elements, may also contain the attribute `toolbar-only`
    - The attribute `toolbar-only` will hide the elements with the attribute in the sidebar, but leave them shown in the toolbar
- The nav element may also contain the attribute `target` that accepts an element id
    - The attribute `target` will place the toolbar into the specified id of the element on the page, without the default toolbar styling.
    - e.g `<nav toolbar="(max-width: 1024px)" target="toolbar-target">`
- Toolbar behavior is only applied while the media-query is valid

Example:

```html
<amp-sidebar id="sidebar1" layout="nodisplay" side="right">
  <ul>
    <li> Nav item 1</li>
    <li> Nav item 2</li>
    <li> Nav item 3</li>
    <li> Nav item 4</li>
    <li> Nav item 5</li>
    <li> Nav item 6</li>
  </ul>

  <nav toolbar="(max-width: 767px)">
    <ul>
      <li>
        <input placeholder="Search..."/>
      </li>
    </ul>
  </nav>
</amp-sidebar>
```

Example (toolbar-only on `<nav>` element):

```html
<amp-sidebar id="sidebar1" layout="nodisplay" side="right">
  <ul>
    <li> Nav item 1</li>
    <li> Nav item 2</li>
    <li> Nav item 3</li>
    <li> Nav item 4</li>
    <li> Nav item 5</li>
    <li> Nav item 6</li>
  </ul>

  <nav toolbar="(min-width: 0px)" toolbar-only>
    <ul>
      <li>
        <input placeholder="Search..."/>
      </li>
    </ul>
  </nav>
</amp-sidebar>
```

Example (toolbar-only on individual `<li>` elements):

```html
<amp-sidebar id="sidebar1" layout="nodisplay" side="right">
  <ul>
    <li> Nav item 1</li>
    <li> Nav item 2</li>
    <li> Nav item 3</li>
    <li> Nav item 4</li>
    <li> Nav item 5</li>
    <li> Nav item 6</li>
  </ul>

  <nav toolbar="(min-width: 768px) and (max-width: 1024px)">
    <ul>
      <li>
        Publisher Logo
      </li>
      <li>
        <input placeholder="Search..." toolbar-only/>
      </li>
    </ul>
  </nav>
</amp-sidebar>
```

Example (target attribute):

```html
<amp-sidebar id="sidebar1" layout="nodisplay" side="right">
  <ul>
    <li> Nav item 1</li>
    <li> Nav item 2</li>
    <li> Nav item 3</li>
    <li> Nav item 4</li>
    <li> Nav item 5</li>
    <li> Nav item 6</li>
  </ul>

  <nav toolbar="(max-width: 767px)" target="toolbar-target">
    <ul>
      <li>
        <input placeholder="Search..."/>
      </li>
    </ul>
  </nav>
</amp-sidebar>

<div id="toolbar-target">
</div>
```


{% call callout('Tip', type='success') %}
See live demos at [AMP By Example](https://ampbyexample.com/components/amp-sidebar/).
{% endcall %}

## Attributes

##### side

Indicates what side of the page the sidebar should open from, either `left` or `right`.  If a `side` is not specified, the `side` value will be inherited from the `body` tag's `dir` attribute (`ltr` => `left` , `rtl` => `right`); if no `dir` exists, the `side` defaults to `left`.

##### layout

Specifies the display layout of the sidebar, which must be `nodisplay`.

##### open

This attribute is present when the sidebar is open.


##### data-close-button-aria-label**

Optional attribute used to set ARIA label for the close button added for accessibility.


##### toolbar

This attribute is present on child `<nav toolbar="(media-query)">` elements, and accepts a media query of when to show a toolbar.

##### toolbar-only

This attribute is present on child `<nav toolbar="(media-query)">`, or children `<li>` elements of `<nav toolbar="(media-query)">` elements, and indicates that the element will only be shown in the toolbar, when the toolbar is shown.

##### target

This attribute is present on child `<nav toolbar="(media-query)">`, and accepts an id of an element on the page.  The attribute `target` will place the toolbar into the specified id of the element on the page, without the default toolbar styling.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Styling

The `amp-sidebar` component can be styled with standard CSS.

-  The `width` of the `amp-sidebar` may be set to adjust the width between the pre-set min(45px) and max(80vw) values.
- The height of the `amp-sidebar` may be set to adjust the height of the sidebar, if required. If the height exceeds 100vw, the sidebar will have a vertical scrollbar. The preset height of the sidebar is 100vw and can be overridden in CSS to make it shorter.
- The current state of the sidebar is exposed via the `open` attribute that is set on the `amp-sidebar` tag when the side bar is open on the page.

{% call callout('Tip', type='success') %}
Visit [AMP Start](https://ampstart.com/components#navigation) for responsive, pre-styled navigation menus that you can use in your AMP pages.
{% endcall %}


## UX considerations

When using `<amp-sidebar>`, keep in mind that your users will often view your page on mobile in an AMP viewer, which may display a fixed-position header. In addition, browsers often display their own fixed header at the top of the page. Adding another fixed-position element at the top of the screen would take up a large amount of mobile screen space with content that gives the user no new information.

For this reason, we recommend that affordances to open the sidebar are not placed in a fixed, full-width header.

## Validation

See [amp-sidebar rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-sidebar/validator-amp-sidebar.protoascii) in the AMP validator specification.
