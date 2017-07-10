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
    A sidebar provides a way to display meta content intended for temporary access (navigation links, buttons, menus, etc.). The sidebar can be revealed by a button tap while the main content remains visually underneath.
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

## Overview
`<amp-sidebar>` hides meta content intended for temporary access (navigation links, buttons, menus, etc.). `<amp-sidebar>` can be opened and closed by button taps, and tapping outside of amp-sidebar.
However, optional attributes that accept media queries can be used to display meta content in other parts of the site. Child `<nav toolbar="">`elements allow
for content within the sidebar to be displayed on other parts of the main content.


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
<amp-sidebar id="sidebar1" layout="nodisplay">
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

To toggle, open, or close the sidebar when an element is tapped or clicked, set the [`on`](../../../spec/amp-actions-and-events.md) action attribute on the element, and specify one of the following action methods:

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

You can create a toolbar element that displays in the `<body>` by specifying the toolbar attribute with a media query on a `<nav>` element that is a child of  `<amp-sedbar>`. The toolbar duplicates the `<nav>` element and its children.

#### Behavior

- The sidebar may implement toolbars by adding nav elements with the toolbar attribute.
- The nav element must be a child of `<amp-sidebar>` and follow this format: `<nav toolbar="(media-query)">`.
    - For instance, this would be a valid use of toolbar: `<nav toolbar="(max-width: 1024px)">`.
- The nav containing the toolbar attribute must only contain a single `<ul>` element, that contains `<li>` elements.
    - The `<li>` elements may may contain any valid HTML elements (supported by AMP), or any of the AMP elements that `<amp-sidebar>` supports.
- The nav element, or it's `<ul>`'s `<li>` elements, may also contain the attribute `toolbar-only`.
    - The attribute `toolbar-only` will hide the elements with the attribute in the sidebar, but leave them shown in the toolbar.
- The nav element may also contain the `target` attribute that accepts an element id.
    - The `target` attribute will place the toolbar into the specified id of the element on the page, without applying the default toolbar class.
    - For example: `<nav toolbar="(max-width: 1024px)" target="toolbar-target">`.
- Toolbar behavior is only applied while the media-query is valid.

Example: Basic Toolbar

In the following example, we display a toolbar if the window width is less than or equal to 767px. The toolbar contains a search input element.

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

Example: Display toolbar content only within the toolbar

In the following example, we display a toolbar if the window width is greater than or equal to 0px. The toolbar contains a search input element. However, with the `toolbar-only` attribute, the `<nav>` element and its children will be hidden inside the sidebar, but visible within the toolbar when the toolbar is displayed.

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

Example: Display specific toolbar items only within the toolbar

In the following example, we display a toolbar if the window width is greater than or equal to 768px, or if the window width is less than or equal to 1024px. The toolbar contains two items, text representing a publisher's logo, and a search input element. However, with the `toolbar-only` attribute, the `<li>` element and its children will be hidden inside the sidebar, but visible within the toolbar when the toolbar is displayed. Other elements that are a child of the `<nav>` element will be displayed inside the sidebar, and the toolbar when the toolbar is displayed.

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
      <li toolbar-only>
        <input placeholder="Search..."/>
      </li>
    </ul>
  </nav>
</amp-sidebar>
```

Example: Displaying the toolbar in the specified `target` element

In the following example, we display a toolbar if the window width is greater than or equal to 768px. The toolbar contains a search input element. However, with the `target` attribute on the `<nav>` element, this will change where the toolbar is placed on the `<body>`. Instead of the toolbar being appended as a child element to the end of the `<body>`, the toolbar will be appended as a child element of the element with the id of `toolbar-target`.

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


##### data-close-button-aria-label

Optional attribute used to set ARIA label for the close button added for accessibility.


##### toolbar

This attribute is present on child `<nav toolbar="(media-query)">` elements, and accepts a media query of when to show a toolbar. See the [Toolbar](#toolbar) section for more information on using toolbars

##### toolbar-only

This attribute is present on child `<nav toolbar="(media-query)">`, or children `<li>` elements of `<nav toolbar="(media-query)">` elements, and indicates that the element will only be shown in the toolbar, when the toolbar is shown. See the [Toolbar](#toolbar) section for more information on using toolbar

##### target

This attribute is present on child `<nav toolbar="(media-query)">`, and accepts an id of an element on the page.  The `target` attribute will place the toolbar into the specified id of the element on the page, without the default toolbar styling. See the [Toolbar](#toolbar) section for more information on using toolbars

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
