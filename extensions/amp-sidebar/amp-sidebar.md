---
$category@: layout
formats:
  - websites
teaser:
  text: Provides a way to display meta content intended for temporary access such as navigation, links, buttons, menus.
bento: true
experimental: true
---

# amp-sidebar

## Usage

Provides a way to display meta content intended for temporary access such as navigation, links, buttons, menus. The sidebar can be revealed by a button tap while the main content remains visually underneath.

`<amp-sidebar>` hides meta content intended for temporary access (navigation links, buttons, menus, etc.). `<amp-sidebar>` can be opened and closed by button taps, and tapping outside of amp-sidebar.
However, optional attributes that accept media queries can be used to display meta content in other parts of the site. Child `<nav toolbar="(media query)" toolbar-target="elementID">` elements allow
for content within the sidebar to be displayed on other parts of the main content.

-   The sidebar can only appear on the left or right side of a page.
-   The `<amp-sidebar>` may contain any valid HTML elements (supported by AMP).
-   The `<amp-sidebar>` may contain any of the following AMP elements:
    -   `<amp-accordion>`
    -   `<amp-img>`
    -   `<amp-fit-text>`
    -   `<amp-list>`
    -   `<amp-live-list>`
    -   `<amp-social-share>`
-   The max-height of the sidebar is 100vh, if the height exceeds 100vh then a vertical scrollbar appears. The default height is set to 100vh in CSS and is overridable in CSS.
-   The width of the sidebar can be set and adjusted using CSS (minimum width is 45px).
-   Touch zoom is disabled on the `amp-sidebar` and its mask when the sidebar is open.
-   `<amp-sidebar>` is _recommended_ to be be a direct child of the `<body>` to preserve a logical DOM order (for accessibility) as well as to avoid altering its behavior by a container element. Note that having an ancestor of `amp-sidebar` with a set `z-index` may cause the sidebar to appear below other elements (such as headers), breaking its functionality.

_Example:_

In the following example, we use `amp-sidebar` to contain navigation items. However, The second and fourth item, Nav Item 2 and Nav Item 4, are assigned to element id that is on the page. By using the [`on`](../../docs/spec/amp-actions-and-events.md) attribute, we can scroll smoothly to the element, using the element id and `scrollTo`.

```html
<amp-sidebar id="sidebar1" layout="nodisplay" side="right">
  <ul>
    <li>Nav item 1</li>
    <li><a href="#idTwo" on="tap:idTwo.scrollTo">Nav item 2</a></li>
    <li>Nav item 3</li>
    <li><a href="#idFour" on="tap:idFour.scrollTo">Nav item 4</a></li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</amp-sidebar>
```

### Standalone use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `amp-sidebar`, see [**`bento-sidebar`**](./1.0/README.md).

### Opening and closing the sidebar

To toggle, open, or close the sidebar when an element is tapped or clicked, set the [`on`](../../docs/spec/amp-actions-and-events.md) action attribute on the element, and specify one of the following action methods:

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

_Example:_

```html
<button class="hamburger" on="tap:sidebar1.toggle"></button>
<button on="tap:sidebar1">Open</button>
<button on="tap:sidebar1.open">Open</button>
<button on="tap:sidebar1.close">x</button>
```

### Toolbar

You can create a `toolbar` element that displays in the `<body>` by specifying the `toolbar` attribute with a media query and a `toolbar-target` attribute with an element id on a `<nav>` element that is a child of `<amp-sidebar>`. The `toolbar` duplicates the `<nav>` element and its children and appends the element into the `toolbar-target` element.

#### Behavior

-   The sidebar may implement toolbars by adding nav elements with the `toolbar` attribute and `toolbar-target` attribute.
-   The nav element must be a child of `<amp-sidebar>` and follow this format: `<nav toolbar="(media-query)" toolbar-target="elementID">`.
    -   For instance, this would be a valid use of toolbar: `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`.
-   The nav containing the toolbar attribute must only contain a single `<ul>` or `<ol>` element, that contains `<li>` elements.
    -   The `<li>` elements may contain any valid HTML elements (supported by AMP), or any of the AMP elements that `<amp-sidebar>` supports.
-   Toolbar behavior is only applied while the `toolbar` attribute media-query is valid. Also, an element with the `toolbar-target` attribute id must exist on the page for the toolbar to be applied.

_Example: Basic Toolbar_

In the following example, we display a `toolbar` if the window width is less than or equal to 767px. The `toolbar` contains a search input element. The `toolbar` element will be appended to the `<div id="target-element">` element.

```html
<amp-sidebar id="sidebar1" layout="nodisplay" side="right">
  <ul>
    <li>Nav item 1</li>
    <li><a href="#idTwo" on="tap:idTwo.scrollTo">Nav item 2</a></li>
    <li>Nav item 3</li>
    <li><a href="#idFour" on="tap:idFour.scrollTo">Nav item 4</a></li>
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
</amp-sidebar>

<div id="target-element"></div>
```

## Styling Toolbar

The `toolbar` element within the `<amp-sidebar>` element, will have classes applied to the element depending if the `toolbar-target` element is shown or hidden. This is useful for applying different styles on the `toolbar` element and then `toolbar-target` element. The classes are `amp-sidebar-toolbar-target-shown`, and `amp-sidebar-toolbar-target-hidden`. The class `amp-sidebar-toolbar-target-shown` is applied to the `toolbar` element when the `toolbar-target` element is shown. The class `amp-sidebar-toolbar-target-hidden` is applied to the `toolbar` element when the `toolbar-target` element is hidden. Additionally, one can customize the opacity of the mask via `amp-sidebar-mask`.

_Example: Toolbar State Classes_

In the following example, we display a `toolbar` if the window width is less than or equal to 767px. The `toolbar` contains a search input element. The `toolbar` element will be appended to the `<div id="target-element">` element. However, we added some custom styles to hide the `toolbar` element, when the `<div id="toolbar-target">` element is shown.

```html
<style amp-custom="">
  .amp-sidebar-toolbar-target-shown {
    display: none;
  }
</style>

<amp-sidebar id="sidebar1" layout="nodisplay" side="right">
  <ul>
    <li>Nav item 1</li>
    <li><a href="#idTwo" on="tap:idTwo.scrollTo">Nav item 2</a></li>
    <li>Nav item 3</li>
    <li><a href="#idFour" on="tap:idFour.scrollTo">Nav item 4</a></li>
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
</amp-sidebar>

<div id="target-element"></div>
```

### Auto scrolling within overflowing areas

`amp-sidebar` can automatically scroll the overflowing container to first element that is decorated with `autoscroll` as an attribute in both sidebar and toolbar cases.

This feature is useful when dealing with long navigation list and wanting the sidebar to scroll to the current navigation items when page loads.

When using `toolbar` feature, `autoscroll` only works if the `<nav toolbar>` element is set to `overflow: auto` or `overflow: scroll`.

```html
<style amp-custom="">
  nav [toolbar] {
    overflow: auto;
  }
</style>

<amp-sidebar id="sidebar1" layout="nodisplay" side="right">
  <nav toolbar="(max-width: 767px)" toolbar-target="target-element">
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li autoscroll class="currentPage">Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
  </nav>
</amp-sidebar>

<div id="target-element"></div>
```

Please see [this example file](https://github.com/ampproject/amphtml/blob/main/examples/amp-sidebar-autoscroll.amp.html) for a working example code.

### Building Nested Menus

`<amp-sidebar>` supports drilldown (nested) menus through a child component named [`<amp-nested-menu>`](../amp-nested-menu/amp-nested-menu.md). With `<amp-nested-menu>`, `<amp-sidebar>` can support nesting one or more layers of submenus (and transition between them) as demonstrated by the following example:

[tip type="note"]
When using `amp-nested-menu`, wrap every menu item in a `li` element to improve accessibility and keyboard support.
[/tip]

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
              <h4 amp-nested-submenu-close>Go back</h4>
            </li>
            <li>
              <h4 amp-nested-submenu-open>Open Another Sub-Menu</h4>
              <div amp-nested-submenu>
                <h4 amp-nested-submenu-close>Go back</h4>
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

See [`<amp-nested-menu>`](../amp-nested-menu/amp-nested-menu.md) for the full documentation on nested menus along with advanced feature such as dynamic content loading.

### UX considerations

When using `<amp-sidebar>`, keep in mind that your users will often view your page on mobile in an AMP viewer, which may display a fixed-position header. In addition, browsers often display their own fixed header at the top of the page. Adding another fixed-position element at the top of the screen would take up a large amount of mobile screen space with content that gives the user no new information.

For this reason, we recommend that affordances to open the sidebar are not placed in a fixed, full-width header.

## Attributes

##### side

Indicates what side of the page the sidebar should open from, either `left` or `right`. If a `side` is not specified, the `side` value will be inherited from the `body` tag's `dir` attribute (`ltr` => `left` , `rtl` => `right`); if no `dir` exists, the `side` defaults to `left`.

##### layout<a name="layout"></a>

Specifies the display layout of the sidebar, which must be `nodisplay`.

##### open

This attribute is present when the sidebar is open.

##### data-close-button-aria-label<a name="data"></a>

Optional attribute used to set ARIA label for the close button added for accessibility.

##### toolbar

This attribute is present on child `<nav toolbar="(media-query)" toolbar-target="elementID">` elements, and accepts a media query of when to show a toolbar. See the [Toolbar](#toolbar) section for more information on using toolbars.

##### toolbar-target

This attribute is present on child `<nav toolbar="(media-query)" toolbar-target="elementID">`, and accepts an id of an element on the page. The `toolbar-target` attribute will place the toolbar into the specified id of the element on the page, without the default toolbar styling. See the [Toolbar](#toolbar) section for more information on using toolbars.

##### data-disable-swipe-close

Including this attribute on `amp-sidebar` disables swipe to close. When using a mobile device or other touch enabled device, swiping to close the sidebar will be disabled.

##### common attributes<a name="common"></a>

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Styling

The `amp-sidebar` component can be styled with standard CSS.

-   The `width` of the `amp-sidebar` may be set to adjust the width between the pre-set min(45px) and max(80vw) values.
-   The height of the `amp-sidebar` may be set to adjust the height of the sidebar, if required. If the height exceeds 100vw, the sidebar will have a vertical scrollbar. The preset height of the sidebar is 100vw and can be overridden in CSS to make it shorter.
-   The current state of the sidebar is exposed via the `open` attribute that is set on the `amp-sidebar` tag when the side bar is open on the page.

[tip type="read-on"]
Visit [AMP Start](https://ampstart.com/components#navigation) for responsive, pre-styled navigation menus that you can use in your AMP pages.
[/tip]

## Validation

See [amp-sidebar rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-sidebar/validator-amp-sidebar.protoascii) in the AMP validator specification.
